"use server"

import prisma from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

interface MemoryData {
  title: string
  coverImageUrl: string
  description: string
  memoryDate: string
  location?: string
  mood?: string
  galleryImages?: string[]
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function saveMemory(data: MemoryData, postId?: string) {
  try {
    const { 
      title, coverImageUrl, description, memoryDate, location, mood, galleryImages 
    } = data;

    if (postId) {
      // Update existing post
      await prisma.memory.update({
        where: { id: postId },
        data: {
          title,
          cover_image_url: coverImageUrl,
          description,
          memory_date: new Date(memoryDate),
          location,
          mood
        }
      });
      
      // Update gallery (delete old and re-insert)
      const existingPostId = postId; // narrowed to string by the if(postId) guard above
      await prisma.postImage.deleteMany({ where: { postId: existingPostId } });
      if (galleryImages && galleryImages.length > 0) {
        await prisma.postImage.createMany({
          data: galleryImages.map((url: string, index: number) => ({
            postId: existingPostId,
            imageUrl: url,
            sortOrder: index + 1
          }))
        });
      }
    } else {
      // Create new post
      const newPost = await prisma.memory.create({
        data: {
          title,
          cover_image_url: coverImageUrl,
          description,
          memory_date: new Date(memoryDate),
          location,
          mood,
          images: {
            create: galleryImages?.map((url: string, index: number) => ({
              imageUrl: url,
              sortOrder: index + 1
            })) || []
          }
        }
      });
      postId = newPost.id;
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
    await prisma.memory.delete({
      where: { id: postId }
    })
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
    await prisma.like.create({
      data: {
        postId,
        sessionIdentifier
      }
    })
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function unlikeMemory(postId: string, sessionIdentifier: string) {
  try {
    await prisma.like.delete({
      where: {
        postId_sessionIdentifier: {
          postId,
          sessionIdentifier
        }
      }
    })
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function addComment(postId: string, username: string, content: string, parentId?: string | null) {
  try {
    await prisma.comment.create({
      data: {
        postId,
        username,
        content,
        ...(parentId ? { parentId } : {})
      }
    })
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function checkLikeStatus(postId: string, sessionIdentifier: string) {
  try {
    const like = await prisma.like.findUnique({
      where: {
        postId_sessionIdentifier: { postId, sessionIdentifier }
      }
    });
    return { hasLiked: !!like };
  } catch (error) {
    return { hasLiked: false };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    await prisma.comment.delete({ where: { id: commentId } });
    if (comment) {
      revalidatePath(`/memories/${comment.postId}`);
    }
    revalidatePath('/admin/comments');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getComments(postId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' }
    });
    return { 
      success: true, 
      comments: comments.map(c => ({
        id: c.id, 
        username: c.username, 
        content: c.content, 
        post_id: c.postId,
        parent_id: c.parentId,
        created_at: c.createdAt.toISOString()
      })) 
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
