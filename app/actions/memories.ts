"use server"

import prisma from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveMemory(data: any, postId?: string) {
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
      await prisma.postImage.deleteMany({ where: { postId: postId } });
      if (galleryImages && galleryImages.length > 0) {
        await prisma.postImage.createMany({
          data: galleryImages.map((url: string, index: number) => ({
            postId,
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
  } catch (error: any) {
    console.error("Save error:", error)
    return { success: false, error: error.message }
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
  } catch (error: any) {
    console.error("Delete error:", error)
    return { success: false, error: error.message }
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
  } catch (error: any) {
    return { success: false, error: error.message }
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
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addComment(postId: string, username: string, content: string) {
  try {
    await prisma.comment.create({
      data: {
        postId,
        username,
        content
      }
    })
    revalidatePath(`/memories/${postId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
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
        created_at: c.createdAt.toISOString()
      })) 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
