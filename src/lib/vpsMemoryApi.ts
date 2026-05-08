/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Comment, Memory } from "@/src/types";

export interface MemoryMutationPayload {
  title?: string | null;
  coverImageUrl: string;
  heroImageUrl?: string | null;
  frameStyle?: string | null;
  description: string;
  memoryDate: string;
  location?: string | null;
  mood?: string | null;
  galleryImages?: string[];
}

export interface AdminComment extends Comment {
  memory: { id: string; title: string | null; description: string } | null;
}

interface IdLikeResponse {
  id?: string;
  postId?: string;
  post_id?: string;
}

function getApiBaseUrl() {
  const baseUrl = process.env.VPS_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VPS_API_BASE_URL is not set");
  }
  return baseUrl.replace(/\/+$/, "");
}

function toIsoDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function toCountArray(value: unknown): { count: number }[] {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0] as { count?: number };
    return [{ count: Number(first.count) || 0 }];
  }
  if (typeof value === "number") {
    return [{ count: value }];
  }
  return [{ count: 0 }];
}

function normalizeMemory(raw: any): Memory {
  const rawImages = Array.isArray(raw?.post_images)
    ? raw.post_images
    : Array.isArray(raw?.images)
      ? raw.images
      : [];

  return {
    id: String(raw?.id ?? ""),
    title: raw?.title ?? null,
    cover_image_url: String(raw?.cover_image_url ?? raw?.coverImageUrl ?? ""),
    hero_image_url: raw?.hero_image_url ?? raw?.heroImageUrl ?? null,
    frame_style: raw?.frame_style ?? raw?.frameStyle ?? "minimal",
    description: String(raw?.description ?? ""),
    memory_date: toIsoDate(raw?.memory_date ?? raw?.memoryDate),
    location: raw?.location ?? null,
    mood: raw?.mood ?? null,
    created_at: toIsoDate(raw?.created_at ?? raw?.createdAt),
    updated_at: toIsoDate(raw?.updated_at ?? raw?.updatedAt),
    post_images: rawImages.map((img: any) => ({
      image_url: String(img?.image_url ?? img?.imageUrl ?? ""),
    })),
    likes: toCountArray(raw?.likes ?? raw?._count?.likes),
    comments: toCountArray(raw?.comments ?? raw?._count?.comments),
  };
}

function normalizeComment(raw: any): Comment {
  return {
    id: String(raw?.id ?? ""),
    post_id: String(raw?.post_id ?? raw?.postId ?? ""),
    username: String(raw?.username ?? ""),
    content: String(raw?.content ?? ""),
    parent_id: raw?.parent_id ?? raw?.parentId ?? null,
    created_at: toIsoDate(raw?.created_at ?? raw?.createdAt),
  };
}

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${getApiBaseUrl()}/${normalized}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

async function requestJson<T>(path: string, init: RequestInit = {}, allowNotFound = false): Promise<T | null> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add internal secret key to authenticate server-to-server requests
  const apiSecret = process.env.VPS_API_SECRET;
  if (apiSecret) {
    headers.set("X-Internal-Secret", apiSecret);
  }

  const url = buildUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(`Cannot reach VPS API at ${url}. ${getErrorMessage(error)}`);
  }

  if (allowNotFound && res.status === 404) {
    return null;
  }

  if (!res.ok) {
    let message = `API request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      message = body.error ?? body.message ?? message;
    } catch {
      // Keep default message when body is not JSON.
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

export async function fetchMemories(): Promise<Memory[]> {
  const data = (await requestJson<any[]>("/memories")) ?? [];
  return data.map((item) => normalizeMemory(item));
}

export async function fetchMemoryById(id: string): Promise<Memory | null> {
  const data = await requestJson<any>(`/memories/${encodeURIComponent(id)}`, {}, true);
  return data ? normalizeMemory(data) : null;
}

export async function fetchAdminComments(): Promise<AdminComment[]> {
  const data = (await requestJson<any[]>("/admin/comments")) ?? [];
  return data.map((raw) => ({
    ...normalizeComment(raw),
    memory: raw?.memory
      ? {
          id: String(raw.memory.id),
          title: raw.memory.title ?? null,
          description: String(raw.memory.description ?? ""),
        }
      : null,
  }));
}

export async function createMemory(payload: MemoryMutationPayload): Promise<string | null> {
  const data = (await requestJson<IdLikeResponse>("/memories", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as IdLikeResponse | null;

  return data?.id ?? data?.postId ?? data?.post_id ?? null;
}

export async function updateMemory(id: string, payload: MemoryMutationPayload): Promise<string | null> {
  const data = (await requestJson<IdLikeResponse>(`/memories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as IdLikeResponse | null;

  return data?.id ?? data?.postId ?? data?.post_id ?? id;
}

export async function removeMemory(id: string): Promise<void> {
  await requestJson(`/memories/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function addLike(postId: string, sessionIdentifier: string): Promise<void> {
  await requestJson(`/memories/${encodeURIComponent(postId)}/likes`, {
    method: "POST",
    body: JSON.stringify({ sessionIdentifier }),
  });
}

export async function removeLike(postId: string, sessionIdentifier: string): Promise<void> {
  await requestJson(
    `/memories/${encodeURIComponent(postId)}/likes?sessionIdentifier=${encodeURIComponent(sessionIdentifier)}`,
    { method: "DELETE" }
  );
}

export async function getLikeStatus(postId: string, sessionIdentifier: string): Promise<boolean> {
  const data = await requestJson<{ hasLiked?: boolean }>(
    `/memories/${encodeURIComponent(postId)}/likes/status?sessionIdentifier=${encodeURIComponent(sessionIdentifier)}`
  );
  return Boolean(data?.hasLiked);
}

export async function addMemoryComment(
  postId: string,
  username: string,
  content: string,
  parentId?: string | null
): Promise<void> {
  await requestJson(`/memories/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ username, content, parentId: parentId ?? null }),
  });
}

export async function fetchMemoryComments(postId: string): Promise<Comment[]> {
  const data = (await requestJson<any[]>(`/memories/${encodeURIComponent(postId)}/comments`)) ?? [];
  return data.map((item) => normalizeComment(item));
}

export async function removeComment(commentId: string): Promise<string | null> {
  const data = (await requestJson<IdLikeResponse>(`/comments/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
  })) as IdLikeResponse | null;

  return data?.postId ?? data?.post_id ?? null;
}