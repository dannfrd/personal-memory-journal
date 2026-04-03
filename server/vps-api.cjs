const { createServer } = require("node:http");
const { URL } = require("node:url");
const { existsSync } = require("node:fs");
const { mkdir, readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

function getUploadToken() {
  return process.env.UPLOAD_API_TOKEN?.trim() || "";
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
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
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
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
  for await (const chunk of req) {
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

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: "Invalid request" });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const { pathname } = url;

  try {
    const uploadFileName = parseId(pathname, "/uploads/");

    if (req.method === "GET" && uploadFileName) {
      const safeName = sanitizeFileName(uploadFileName);
      if (!safeName) {
        sendJson(res, 400, { error: "Invalid filename" });
        return;
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.resolve(uploadDir, safeName);
      if (!filePath.startsWith(path.resolve(uploadDir) + path.sep) && filePath !== path.resolve(uploadDir, safeName)) {
        sendJson(res, 400, { error: "Invalid filename" });
        return;
      }

      try {
        const fileBuffer = await readFile(filePath);
        res.writeHead(200, {
          "Content-Type": getMimeTypeFromFileName(safeName),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(fileBuffer);
      } catch (error) {
        if (error && error.code === "ENOENT") {
          sendJson(res, 404, { error: "File not found" });
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
        sendJson(res, 401, { error: "Unauthorized upload request" });
        return;
      }

      const contentType = getHeaderValue(req, "content-type").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_UPLOAD_TYPES.has(contentType)) {
        sendJson(res, 400, { error: "Invalid file type" });
        return;
      }

      const incomingFileName = getHeaderValue(req, "x-file-name");
      const safeName = sanitizeFileName(incomingFileName || `upload-${Date.now()}`);
      if (!safeName) {
        sendJson(res, 400, { error: "Invalid filename" });
        return;
      }

      const fileBuffer = await readBufferBody(req, MAX_UPLOAD_SIZE_BYTES);
      if (fileBuffer.length === 0) {
        sendJson(res, 400, { error: "No file uploaded" });
        return;
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.resolve(uploadDir, safeName);
      if (!filePath.startsWith(path.resolve(uploadDir) + path.sep) && filePath !== path.resolve(uploadDir, safeName)) {
        sendJson(res, 400, { error: "Invalid filename" });
        return;
      }

      await writeFile(filePath, fileBuffer);

      const encodedName = encodeURIComponent(safeName);
      const uploadBaseUrl = getUploadBaseUrl();
      const url = uploadBaseUrl ? `${uploadBaseUrl}/uploads/${encodedName}` : `/uploads/${encodedName}`;

      sendJson(res, 201, { url, filename: safeName });
      return;
    }

    if (req.method === "HEAD" && pathname === "/health") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    if (req.method === "GET" && pathname === "/memories") {
      const memories = await prisma.memory.findMany({
        orderBy: { memory_date: "desc" },
        include: {
          images: { select: { imageUrl: true }, orderBy: { sortOrder: "asc" } },
          _count: { select: { likes: true, comments: true } },
        },
      });

      sendJson(res, 200, memories.map(mapMemory));
      return;
    }

    const memoryId = parseId(pathname, "/memories/");
    if (req.method === "GET" && memoryId && !pathname.includes("/likes") && !pathname.includes("/comments")) {
      const memory = await prisma.memory.findUnique({
        where: { id: memoryId },
        include: {
          images: { select: { imageUrl: true }, orderBy: { sortOrder: "asc" } },
          _count: { select: { likes: true, comments: true } },
        },
      });

      if (!memory) {
        sendJson(res, 404, { error: "Memory not found" });
        return;
      }

      sendJson(res, 200, mapMemory(memory));
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
      });

      sendJson(res, 201, { id: created.id });
      return;
    }

    if (req.method === "PUT" && memoryId && !pathname.includes("/likes") && !pathname.includes("/comments")) {
      const body = await readJsonBody(req);
      const coverImageUrl = requireString(body.coverImageUrl, "coverImageUrl");
      const description = requireString(body.description, "description");
      const memoryDate = requireString(body.memoryDate, "memoryDate");
      const galleryImages = Array.isArray(body.galleryImages) ? body.galleryImages : [];

      await prisma.memory.update({
        where: { id: memoryId },
        data: {
          title: body.title ?? null,
          cover_image_url: coverImageUrl,
          description,
          memory_date: new Date(memoryDate),
          location: body.location ?? null,
          mood: body.mood ?? null,
        },
      });

      await prisma.postImage.deleteMany({ where: { postId: memoryId } });
      if (galleryImages.length > 0) {
        await prisma.postImage.createMany({
          data: galleryImages.map((urlValue, index) => ({
            postId: memoryId,
            imageUrl: String(urlValue),
            sortOrder: index + 1,
          })),
        });
      }

      sendJson(res, 200, { id: memoryId });
      return;
    }

    if (req.method === "DELETE" && memoryId && !pathname.includes("/likes") && !pathname.includes("/comments")) {
      await prisma.memory.delete({ where: { id: memoryId } });
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
        });
      } catch (error) {
        if (!error || error.code !== "P2002") {
          throw error;
        }
      }

      sendJson(res, 200, { success: true });
      return;
    }

    if (likesMatch && req.method === "DELETE") {
      const postId = decodeURIComponent(likesMatch[1]);
      const sessionIdentifier = requireString(url.searchParams.get("sessionIdentifier"), "sessionIdentifier");

      try {
        await prisma.like.delete({
          where: {
            postId_sessionIdentifier: {
              postId,
              sessionIdentifier,
            },
          },
        });
      } catch (error) {
        if (!error || error.code !== "P2025") {
          throw error;
        }
      }

      sendJson(res, 200, { success: true });
      return;
    }

    const likesStatusMatch = pathname.match(/^\/memories\/([^/]+)\/likes\/status$/);
    if (likesStatusMatch && req.method === "GET") {
      const postId = decodeURIComponent(likesStatusMatch[1]);
      const sessionIdentifier = requireString(url.searchParams.get("sessionIdentifier"), "sessionIdentifier");

      const like = await prisma.like.findUnique({
        where: {
          postId_sessionIdentifier: {
            postId,
            sessionIdentifier,
          },
        },
      });

      sendJson(res, 200, { hasLiked: Boolean(like) });
      return;
    }

    const commentsMatch = pathname.match(/^\/memories\/([^/]+)\/comments$/);
    if (commentsMatch && req.method === "GET") {
      const postId = decodeURIComponent(commentsMatch[1]);
      const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
      });

      sendJson(res, 200, comments.map(mapComment));
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
      });

      sendJson(res, 201, mapComment(created));
      return;
    }

    const singleCommentMatch = pathname.match(/^\/comments\/([^/]+)$/);
    if (singleCommentMatch && req.method === "DELETE") {
      const commentId = decodeURIComponent(singleCommentMatch[1]);
      const existing = await prisma.comment.findUnique({ where: { id: commentId } });

      if (!existing) {
        sendJson(res, 404, { error: "Comment not found" });
        return;
      }

      await prisma.comment.delete({ where: { id: commentId } });
      sendJson(res, 200, { postId: existing.postId });
      return;
    }

    if (req.method === "GET" && pathname === "/admin/comments") {
      const comments = await prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          memory: {
            select: { id: true, title: true, description: true },
          },
        },
      });

      sendJson(
        res,
        200,
        comments.map((comment) => ({
          ...mapComment(comment),
          memory: comment.memory
            ? {
                id: comment.memory.id,
                title: comment.memory.title,
                description: comment.memory.description,
              }
            : null,
        }))
      );
      return;
    }

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = error && typeof error === "object" ? error.code : undefined;

    if (code === "PAYLOAD_TOO_LARGE") {
      sendJson(res, 413, { error: "File too large. Maximum size is 10 MB." });
      return;
    }

    if (code === "P2025") {
      sendJson(res, 404, { error: "Data not found" });
      return;
    }

    console.error("API error:", error);
    sendJson(res, 500, { error: message });
  }
});

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
