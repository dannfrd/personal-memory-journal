import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/src/lib/prisma";
import { Navbar } from "@/src/components/Navbar";
import { formatDate } from "@/src/lib/utils";
import { MemoryDetailGallery } from "@/src/components/MemoryDetailGallery";
import { LikeButton } from "@/src/components/social/LikeButton";
import { Comments } from "@/src/components/social/Comments";

export const revalidate = 0;

export default async function MemoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let memory: any = null;
  let error: any = null;
  
  try {
    const rawMemory = await prisma.memory.findUnique({
      where: { id },
      include: {
        images: { select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { likes: true } }
      }
    });

    if (rawMemory) {
      memory = {
        ...rawMemory,
        post_images: rawMemory.images.map(img => ({ image_url: img.imageUrl })),
        likes: [{ count: rawMemory._count.likes }]
      };
    }
  } catch (err: any) {
    error = err;
  }

  if (error || !memory) {
    notFound();
  }
  
  const likeCount = memory.likes?.[0]?.count || 0;

  return (
    <div className="min-h-screen font-sans bg-[#EAE5DF] text-[#2B303A] selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Typography & Social Side */}
        <div className="relative z-10 flex w-full flex-col px-8 py-32 sm:px-16 lg:w-1/2 lg:px-24 xl:px-32 bg-[#EAE5DF]">
          <Link 
            href="/" 
            className="group mb-16 inline-flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity self-start"
          >
           <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
           Back to Gallery
          </Link>

          <article>
            <div className="mb-12 flex flex-wrap items-center gap-6 text-sm font-bold tracking-[0.2em] uppercase opacity-60">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                {formatDate(memory.memory_date)}
              </span>
              {memory.location && (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {memory.location}
                </span>
              )}
              {memory.mood && (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {memory.mood}
                </span>
              )}
            </div>
            
            {memory.title && (
               <h1 className="mb-6 font-serif text-4xl sm:text-5xl leading-tight tracking-tight">
                 {memory.title}
               </h1>
            )}

            <div className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-relaxed sm:leading-[1.6] tracking-tight">
              {memory.description.split('\n').map((paragraph: string, idx: number) => (
                <p key={idx} className={idx > 0 && paragraph.trim() !== '' ? "mt-8" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-16 flex items-center">
               <LikeButton postId={memory.id} initialCount={likeCount} />
            </div>

            <Comments postId={memory.id} />
          </article>
        </div>

        {/* Right Sticky Image Gallery Side */}
        <div className="relative w-full min-h-[60vh] lg:h-screen lg:w-1/2 lg:sticky lg:top-0 order-first lg:order-last bg-[#D2CBC0]">
          <MemoryDetailGallery coverImage={memory.cover_image_url} images={memory.post_images} />
        </div>
      </main>
    </div>
  );
}
