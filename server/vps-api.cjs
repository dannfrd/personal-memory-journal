/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:http");
const { URL } = require("node:url");
const { existsSync, createReadStream } = require("node:fs");
const { mkdir, stat, writeFile } = require("node:fs/promises");
const { pipeline } = require("node:stream");
const { gzipSync, brotliCompressSync, constants: zlibConstants } = require("node:zlib");
const { createHash } = require("node:crypto");
const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

// ─── BE-08 & DB-05: Connection Pool Optimization for 2 vCPU / 4 GB RAM VPS ───
function buildDatabaseUrl(rawUrl) {
  if (!rawUrl) return undefined;
  try {
    const parsed = new URL(rawUrl);
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", process.env.DB_POOL_SIZE || "10");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "15");
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

const optimizedDbUrl = buildDatabaseUrl(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  ...(optimizedDbUrl ? { datasources: { db: { url: optimizedDbUrl } } } : {}),
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// ─── BE-04: Lightweight Bounded In-Memory LRU Cache (TTL + Invalidation) ─────
const CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 30_000);
const MAX_CACHE_ENTRIES = 200;
const apiCache = new Map();

function getCached(key) {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data, ttlMs = CACHE_TTL_MS) {
  if (apiCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = apiCache.keys().next().value;
    if (oldestKey) apiCache.delete(oldestKey);
  }
  apiCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function invalidateCache(prefix = "") {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix) || key.startsWith("memories:list")) {
      apiCache.delete(key);
    }
  }
}

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

function getUploadToken() {
  return process.env.UPLOAD_API_TOKEN?.trim() || "";
}

function getInternalSecret() {
  return process.env.VPS_API_SECRET?.trim() || "";
}

// ─── BE-06 & BE-07: HTTP Compression (Brotli / Gzip) + ETag + Cache-Control ──
function sendJson(req, res, statusCode, payload, cachePolicy = "no-store") {
  const rawJson = JSON.stringify(payload);
  const rawBuffer = Buffer.from(rawJson, "utf8");

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret, X-Upload-Token, X-File-Name",
    "Cache-Control": cachePolicy,
    Vary: "Accept-Encoding",
  };

  if (req && req.method === "GET" && statusCode === 200) {
    const etag = `"${createHash("sha1").update(rawBuffer).digest("base64url")}"`;
    headers.ETag = etag;
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
  }

  const acceptEncoding = req ? String(req.headers["accept-encoding"] || "") : "";
  if (rawBuffer.length > 1024) {
    if (acceptEncoding.includes("br")) {
      const compressed = brotliCompressSync(rawBuffer, {
        params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 },
      });
      headers["Content-Encoding"] = "br";
      headers["Content-Length"] = compressed.length;
      res.writeHead(statusCode, headers);
      res.end(compressed);
      return;
    }
    if (acceptEncoding.includes("gzip")) {
      const compressed = gzipSync(rawBuffer, { level: 6 });
      headers["Content-Encoding"] = "gzip";
      headers["Content-Length"] = compressed.length;
      res.writeHead(statusCode, headers);
      res.end(compressed);
      return;
    }
  }

  headers["Content-Length"] = rawBuffer.length;
  res.writeHead(statusCode, headers);
  res.end(rawBuffer);
}

function toIsoDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function sanitizeFileName(value) {
  const input = typeof value === "string" ? value : "";
  return path.basename(input).replace(/[^a-zA-Z0-9.\-_]/g, "");
}

function getMimeTypeFromFileName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

function normalizeUploadType(type) {
  const lowered = String(type || "").toLowerCase();
  if (lowered === "image/jpg" || lowered === "image/pjpeg" || lowered === "image/jfif") {
    return "image/jpeg";
  }
  return lowered;
}

function getHeaderValue(req, name) {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function getUploadBaseUrl() {
  const fromEnv = process.env.PUBLIC_UPLOAD_BASE_URL?.trim() || process.env.VPS_API_BASE_URL?.trim() || "";
  return fromEnv.replace(/\/+$/, "");
}

async function readBufferBody(req, maxBytes) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const error = new Error("Payload too large");
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function mapMemory(raw) {
  return {
    id: raw.id,
    title: raw.title ?? null,
    cover_image_url: raw.cover_image_url,
    hero_image_url: raw.hero_image_url ?? null,
    frame_style: raw.frame_style ?? "minimal",
    description: raw.description,
    memory_date: toIsoDate(raw.memory_date),
    location: raw.location ?? null,
    mood: raw.mood ?? null,
    created_at: toIsoDate(raw.createdAt),
    updated_at: toIsoDate(raw.updatedAt),
    post_images: (raw.images || []).map((img) => ({ image_url: img.imageUrl })),
    likes: [{ count: raw._count?.likes || 0 }],
    comments: [{ count: raw._count?.comments || 0 }],
  };
}

function mapComment(raw) {
  return {
    id: raw.id,
    post_id: raw.postId,
    parent_id: raw.parentId ?? null,
    username: raw.username,
    content: raw.content,
    created_at: toIsoDate(raw.createdAt),
  };
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  const maxJsonBytes = 2 * 1024 * 1024; // 2 MB limit for JSON payloads
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxJsonBytes) {
      const error = new Error("JSON payload too large");
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

function parseId(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  if (!rest) return null;
  if (rest.includes("/")) return null;
  return decodeURIComponent(rest);
}

function requireString(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function parsePagination(searchParams, defaultLimit = 100, maxLimit = 200) {
  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));
  const hasPagination = searchParams.has("page") || searchParams.has("limit");

  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(Math.floor(limitParam), maxLimit)
    : defaultLimit;
  const page = Number.isFinite(pageParam) && pageParam > 0
    ? Math.floor(pageParam)
    : 1;
  const skip = (page - 1) * limit;

  return { hasPagination, page, limit, skip };
}

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(req, res, 400, { error: "Invalid request" });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret, X-Upload-Token, X-File-Name",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const { pathname, searchParams } = url;

  // ─── Internal Secret Validation ─────────────────────────────────────────────
  // Public endpoints: GET/HEAD /uploads/*, GET/HEAD /health — skip auth
  const isPublicEndpoint =
    ((req.method === "GET" || req.method === "HEAD") && pathname.startsWith("/uploads/")) ||
    ((req.method === "GET" || req.method === "HEAD") && pathname === "/health");

  const expectedSecret = getInternalSecret();
  if (!isPublicEndpoint && expectedSecret) {
    const incomingSecret = getHeaderValue(req, "x-internal-secret");
    if (incomingSecret !== expectedSecret) {
      sendJson(req, res, 403, { error: "Forbidden: Invalid internal secret" });
      return;
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  try {
    const uploadFileName = parseId(pathname, "/uploads/");

    // ─── IMG-06 & BE-05: Stream Static Uploads with ETag & Immutable Cache ───
    if ((req.method === "GET" || req.method === "HEAD") && uploadFileName) {
      const safeName = sanitizeFileName(uploadFileName);
      if (!safeName) {
        sendJson(req, res, 400, { error: "Invalid filename" });
        return;
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.resolve(uploadDir, safeName);
      if (!filePath.startsWith(path.resolve(uploadDir) + path.sep) && filePath !== path.resolve(uploadDir, safeName)) {
        sendJson(req, res, 400, { error: "Invalid filename" });
        return;
      }

      try {
        const fileStat = await stat(filePath);
        const etag = `W/"${fileStat.size.toString(16)}-${Math.floor(fileStat.mtimeMs).toString(16)}"`;
        const lastModified = fileStat.mtime.toUTCString();

        const headers = {
          "Content-Type": getMimeTypeFromFileName(safeName),
          "Content-Length": fileStat.size,
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: etag,
          "Last-Modified": lastModified,
          "Access-Control-Allow-Origin": "*",
        };

        if (req.headers["if-none-match"] === etag) {
          res.writeHead(304, headers);
          res.end();
          return;
        }

        res.writeHead(200, headers);
        if (req.method === "HEAD") {
          res.end();
          return;
        }

        const stream = createReadStream(filePath);
        pipeline(stream, res, (err) => {
          if (err && !res.headersSent) {
            sendJson(req, res, 500, { error: "Stream error" });
          }
        });
      } catch (error) {
        if (error && error.code === "ENOENT") {
          sendJson(req, res, 404, { error: "File not found" });
          return;
        }
        throw error;
      }
      return;
    }

    if (req.method === "POST" && pathname === "/uploads") {
      const expectedToken = getUploadToken();
      const incomingToken = getHeaderValue(req, "x-upload-token");
      if (expectedToken && incomingToken !== expectedToken) {
        sendJson(req, res, 401, { error: "Unauthorized upload request" });
        return;
      }

      const rawType = getHeaderValue(req, "content-type").split(";")[0].trim();
      const contentType = normalizeUploadType(rawType);
      if (!ALLOWED_UPLOAD_TYPES.has(contentType)) {
        sendJson(req, res, 400, { error: "Invalid file type" });
        return;
      }

      const incomingFileName = getHeaderValue(req, "x-file-name");
      const safeName = sanitizeFileName(incomingFileName || `upload-${Date.now()}`);
      if (!safeName) {
        sendJson(req, res, 400, { error: "Invalid filename" });
        return;
      }

      const fileBuffer = await readBufferBody(req, MAX_UPLOAD_SIZE_BYTES);
      if (fileBuffer.length === 0) {
        sendJson(req, res, 400, { error: "No file uploaded" });
        return;
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.resolve(uploadDir, safeName);
      if (!filePath.startsWith(path.resolve(uploadDir) + path.sep) && filePath !== path.resolve(uploadDir, safeName)) {
        sendJson(req, res, 400, { error: "Invalid filename" });
        return;
      }

      await writeFile(filePath, fileBuffer);

      const encodedName = encodeURIComponent(safeName);
      const uploadBaseUrl = getUploadBaseUrl();
      const fileUrl = uploadBaseUrl ? `${uploadBaseUrl}/uploads/${encodedName}` : `/uploads/${encodedName}`;

      sendJson(req, res, 201, { url: fileUrl, filename: safeName });
      return;
    }

    if (req.method === "HEAD" && pathname === "/health") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && pathname === "/health") {
      const mem = process.memoryUsage();
      sendJson(req, res, 200, {
        status: "ok",
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        cacheEntries: apiCache.size,
      });
      return;
    }

    // ─── BE-01, BE-02, BE-03, BE-04, DB-02, DB-03: Memories List + Pagination ─
    if (req.method === "GET" && pathname === "/memories") {
      const { page, limit, skip } = parsePagination(searchParams, 100, 200);
      const cacheKey = `memories:list:${page}:${limit}`;
      const cached = getCached(cacheKey);
      if (cached) {
        sendJson(req, res, 200, cached, "public, max-age=15, stale-while-revalidate=60");
        return;
      }

      const memories = await prisma.memory.findMany({
        orderBy: { memory_date: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          cover_image_url: true,
          hero_image_url: true,
          frame_style: true,
          description: true,
          memory_date: true,
          location: true,
          mood: true,
          createdAt: true,
          updatedAt: true,
          images: { select: { imageUrl: true }, orderBy: { sortOrder: "asc" } },
          _count: { select: { likes: true, comments: true } },
        },
      });

      const mapped = memories.map(mapMemory);
      setCached(cacheKey, mapped);
      sendJson(req, res, 200, mapped, "public, max-age=15, stale-while-revalidate=60");
      return;
    }

    const memoryId = parseId(pathname, "/memories/");
    if (req.method === "GET" && memoryId && !pathname.includes("/likes") && !pathname.includes("/comments")) {
      const cacheKey = `memories:detail:${memoryId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        sendJson(req, res, 200, cached, "public, max-age=15, stale-while-revalidate=60");
        return;
      }

      const memory = await prisma.memory.findUnique({
        where: { id: memoryId },
        select: {
          id: true,
          title: true,
          cover_image_url: true,
          hero_image_url: true,
          frame_style: true,
          description: true,
          memory_date: true,
          location: true,
          mood: true,
          createdAt: true,
          updatedAt: true,
          images: { select: { imageUrl: true }, orderBy: { sortOrder: "asc" } },
          _count: { select: { likes: true, comments: true } },
        },
      });

      if (!memory) {
        sendJson(req, res, 404, { error: "Memory not found" });
        return;
      }

      const mapped = mapMemory(memory);
      setCached(cacheKey, mapped);
      sendJson(req, res, 200, mapped, "public, max-age=15, stale-while-revalidate=60");
      return;
    }

    if (req.method === "POST" && pathname === "/memories") {
      const body = await readJsonBody(req);
      const coverImageUrl = requireString(body.coverImageUrl, "coverImageUrl");
      const description = requireString(body.description, "description");
      const memoryDate = requireString(body.memoryDate, "memoryDate");
      const galleryImages = Array.isArray(body.galleryImages) ? body.galleryImages : [];

      const created = await prisma.memory.create({
        data: {
          title: body.title ?? null,
          cover_image_url: coverImageUrl,
          hero_image_url: body.heroImageUrl ?? null,
          frame_style: body.frameStyle ?? "minimal",
          description,
          memory_date: new Date(memoryDate),
          location: body.location ?? null,
          mood: body.mood ?? null,
          images: {
            create: galleryImages.map((urlValue, index) => ({
              imageUrl: String(urlValue),
              sortOrder: index + 1,
            })),
          },
        },
        select: { id: true },
      });

      invalidateCache("memories:");
      sendJson(req, res, 201, { id: created.id });
      return;
    }

    if (req.method === "PUT" && memoryId && !pathname.includes("/likes") && !pathname.includes("/comments")) {
      const body = await readJsonBody(req);
      const coverImageUrl = requireString(body.coverImageUrl, "coverImageUrl");
      const description = requireString(body.description, "description");
      const memoryDate = requireString(body.memoryDate, "memoryDate");
      const galleryImages = Array.isArray(body.galleryImages) ? body.galleryImages : [];

      await prisma.$transaction([
        prisma.memory.update({
          where: { id: memoryId },
          data: {
            title: body.title ?? null,
            cover_image_url: coverImageUrl,
            hero_image_url: body.heroImageUrl ?? null,
            frame_style: body.frameStyle ?? "minimal",
            description,
            memory_date: new Date(memoryDate),
            location: body.location ?? null,
            mood: body.mood ?? null,
          },
          select: { id: true },
        }),
        prisma.postImage.deleteMany({ where: { postId: memoryId } }),
        ...(galleryImages.length > 0
          ? [
              prisma.postImage.createMany({
                data: galleryImages.map((urlValue, index) => ({
                  postId: memoryId,
                  imageUrl: String(urlValue),
                  sortOrder: index + 1,
                })),
              }),
            ]
          : []),
      ]);

      invalidateCache(`memories:detail:${memoryId}`);
      sendJson(req, res, 200, { id: memoryId });
      return;
    }

    if (req.method === "DELETE" && memoryId && !pathname.includes("/likes") && !pathname.includes("/comments")) {
      await prisma.memory.delete({ where: { id: memoryId }, select: { id: true } });
      invalidateCache(`memories:detail:${memoryId}`);
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
      });
      res.end();
      return;
    }

    const likesMatch = pathname.match(/^\/memories\/([^/]+)\/likes$/);
    if (likesMatch && req.method === "POST") {
      const postId = decodeURIComponent(likesMatch[1]);
      const body = await readJsonBody(req);
      const sessionIdentifier = requireString(body.sessionIdentifier, "sessionIdentifier");

      try {
        await prisma.like.create({
          data: { postId, sessionIdentifier },
          select: { id: true },
        });
      } catch (error) {
        if (!error || error.code !== "P2002") {
          throw error;
        }
      }

      invalidateCache(`memories:detail:${postId}`);
      sendJson(req, res, 200, { success: true });
      return;
    }

    if (likesMatch && req.method === "DELETE") {
      const postId = decodeURIComponent(likesMatch[1]);
      const sessionIdentifier = requireString(searchParams.get("sessionIdentifier"), "sessionIdentifier");

      try {
        await prisma.like.delete({
          where: {
            postId_sessionIdentifier: {
              postId,
              sessionIdentifier,
            },
          },
          select: { id: true },
        });
      } catch (error) {
        if (!error || error.code !== "P2025") {
          throw error;
        }
      }

      invalidateCache(`memories:detail:${postId}`);
      sendJson(req, res, 200, { success: true });
      return;
    }

    const likesStatusMatch = pathname.match(/^\/memories\/([^/]+)\/likes\/status$/);
    if (likesStatusMatch && req.method === "GET") {
      const postId = decodeURIComponent(likesStatusMatch[1]);
      const sessionIdentifier = requireString(searchParams.get("sessionIdentifier"), "sessionIdentifier");

      const like = await prisma.like.findUnique({
        where: {
          postId_sessionIdentifier: {
            postId,
            sessionIdentifier,
          },
        },
        select: { id: true },
      });

      // CDN-05: Private user state must not be publicly cached
      sendJson(req, res, 200, { hasLiked: Boolean(like) }, "private, no-store");
      return;
    }

    const commentsMatch = pathname.match(/^\/memories\/([^/]+)\/comments$/);
    if (commentsMatch && req.method === "GET") {
      const postId = decodeURIComponent(commentsMatch[1]);
      const { page, limit, skip } = parsePagination(searchParams, 100, 200);
      const cacheKey = `comments:post:${postId}:${page}:${limit}`;
      const cached = getCached(cacheKey);
      if (cached) {
        sendJson(req, res, 200, cached, "public, max-age=10, stale-while-revalidate=30");
        return;
      }

      const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          postId: true,
          parentId: true,
          username: true,
          content: true,
          createdAt: true,
        },
      });

      const mapped = comments.map(mapComment);
      setCached(cacheKey, mapped);
      sendJson(req, res, 200, mapped, "public, max-age=10, stale-while-revalidate=30");
      return;
    }

    if (commentsMatch && req.method === "POST") {
      const postId = decodeURIComponent(commentsMatch[1]);
      const body = await readJsonBody(req);
      const username = requireString(body.username, "username");
      const content = requireString(body.content, "content");

      const created = await prisma.comment.create({
        data: {
          postId,
          username,
          content,
          parentId: body.parentId ?? null,
        },
        select: {
          id: true,
          postId: true,
          parentId: true,
          username: true,
          content: true,
          createdAt: true,
        },
      });

      invalidateCache(`comments:post:${postId}`);
      invalidateCache(`memories:detail:${postId}`);
      invalidateCache("admin:comments");
      sendJson(req, res, 201, mapComment(created));
      return;
    }

    const singleCommentMatch = pathname.match(/^\/comments\/([^/]+)$/);
    if (singleCommentMatch && req.method === "DELETE") {
      const commentId = decodeURIComponent(singleCommentMatch[1]);
      const existing = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, postId: true },
      });

      if (!existing) {
        sendJson(req, res, 404, { error: "Comment not found" });
        return;
      }

      await prisma.comment.delete({ where: { id: commentId }, select: { id: true } });
      invalidateCache(`comments:post:${existing.postId}`);
      invalidateCache(`memories:detail:${existing.postId}`);
      invalidateCache("admin:comments");
      sendJson(req, res, 200, { postId: existing.postId });
      return;
    }

    if (req.method === "GET" && pathname === "/admin/comments") {
      const { page, limit, skip } = parsePagination(searchParams, 100, 200);
      const comments = await prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          postId: true,
          parentId: true,
          username: true,
          content: true,
          createdAt: true,
          memory: {
            select: { id: true, title: true, description: true },
          },
        },
      });

      // CDN-05: Admin data is private
      sendJson(
        req,
        res,
        200,
        comments.map((comment) => ({
          ...mapComment(comment),
          memory: comment.memory
            ? {
                id: comment.memory.id,
                title: comment.memory.title,
                description: comment.memory.description.slice(0, 120),
              }
            : null,
        })),
        "private, no-store"
      );
      return;
    }

    sendJson(req, res, 404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = error && typeof error === "object" ? error.code : undefined;

    if (code === "PAYLOAD_TOO_LARGE") {
      sendJson(req, res, 413, { error: "File too large. Maximum size is 25 MB." });
      return;
    }

    if (code === "P2025") {
      sendJson(req, res, 404, { error: "Data not found" });
      return;
    }

    console.error("API error:", error);
    sendJson(req, res, 500, { error: message });
  }
});

// Keep-alive optimization for local reverse proxy / Next.js SSR calls
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

const host = process.env.HOST || "::";
const port = Number(process.env.PORT || 3001);

server.listen(port, host, () => {
  console.log(`VPS Memory API listening on http://${host}:${port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
