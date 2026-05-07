"use server"

import { revalidatePath } from "next/cache"
import {
  addLike,
  addMemoryComment,
  createMemory,
  fetchMemoryComments,
  getLikeStatus,
  removeComment,
  removeLike,
  removeMemory,
  updateMemory,
  type MemoryMutationPayload,
} from "@/src/lib/vpsMemoryApi"

interface MemoryData extends MemoryMutationPayload {
  title?: string | null
  coverImageUrl: string
  heroImageUrl?: string | null
  frameStyle?: string | null
  description: string
  memoryDate: string
  location?: string | null
  mood?: string | null
  galleryImages?: string[]
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function saveMemory(data: MemoryData, postId?: string) {
  try {
    if (postId) {
      await updateMemory(postId, data);
    } else {
      postId = await createMemory(data) ?? undefined;
    }

    revalidatePath('/')
    revalidatePath('/admin/posts')
    return { success: true, postId }
  } catch (error: unknown) {
    console.error("Save error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteMemory(postId: string) {
  try {
    await removeMemory(postId)
    revalidatePath('/')
    revalidatePath('/admin/posts')
    return { success: true }
  } catch (error: unknown) {
    console.error("Delete error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function likeMemory(postId: string, sessionIdentifier: string) {
  try {
    await addLike(postId, sessionIdentifier)
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function unlikeMemory(postId: string, sessionIdentifier: string) {
  try {
    await removeLike(postId, sessionIdentifier)
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function addComment(postId: string, username: string, content: string, parentId?: string | null) {
  try {
    await addMemoryComment(postId, username, content, parentId)
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function checkLikeStatus(postId: string, sessionIdentifier: string) {
  try {
    const hasLiked = await getLikeStatus(postId, sessionIdentifier)
    return { hasLiked };
  } catch {
    return { hasLiked: false };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const postId = await removeComment(commentId)
    if (postId) {
      revalidatePath(`/memories/${postId}`)
    }
    revalidatePath('/admin/comments')
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getComments(postId: string) {
  try {
    const comments = await fetchMemoryComments(postId)
    return { 
      success: true, 
      comments: comments.map(c => ({
        id: c.id, 
        username: c.username, 
        content: c.content, 
        post_id: c.post_id,
        parent_id: c.parent_id,
        created_at: c.created_at
      })) 
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
