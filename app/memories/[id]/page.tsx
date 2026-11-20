import { MemoryDetailGallery } from "@/src/components/MemoryDetailGallery";
import { Navbar } from "@/src/components/Navbar";
import { CommentModalButton } from "@/src/components/social/CommentModalButton";
import { LikeButton } from "@/src/components/social/LikeButton";
import { formatDate } from "@/src/lib/utils";
import { fetchMemoryById } from "@/src/lib/vpsMemoryApi";
import type { Memory } from "@/src/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 30;

export default async function MemoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let memory: Memory | null = null;
  let error: unknown = null;
  
  try {
    memory = await fetchMemoryById(id);
  } catch (err) {
    error = err;
  }

  if (error || !memory) {
    notFound();
  }
  
  const likeCount = memory.likes?.[0]?.count || 0;
  const commentCount = memory.comments?.[0]?.count || 0;

  return (
    <div className="min-h-screen font-sans bg-[#EAE5DF] text-[#2B303A] selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Typography & Social Side */}
        <div className="relative z-10 flex w-full flex-col px-6 py-20 sm:px-14 sm:py-28 lg:w-1/2 lg:px-20 xl:px-28 bg-[#EAE5DF]">
          <Link 
            href="/#gallery" 
            className="group mb-12 inline-flex min-h-[44px] items-center gap-3 text-xs font-bold tracking-[0.22em] uppercase text-[#2B303A]/75 hover:text-[#2B303A] transition-colors self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A] rounded-full pr-4"
          >
           <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
           Kembali ke Galeri
          </Link>

          <article className="max-w-[62ch]">
            <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold tracking-[0.22em] uppercase text-[#2B303A]/70">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                {formatDate(memory.memory_date)}
              </span>
              {memory.location && (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                  {memory.location}
                </span>
              )}
              {memory.mood && (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                  {memory.mood}
                </span>
              )}
            </div>
            
            {memory.title && (
               <h1 className="mb-8 font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.12] tracking-tight text-[#1F242D]">
                 {memory.title}
               </h1>
            )}

            <div className="font-serif text-xl sm:text-2xl lg:text-[26px] leading-[1.7] tracking-normal text-[#2B303A]/90">
              {memory.description.split('\n').map((paragraph: string, idx: number) => (
                <p key={idx} className={idx > 0 && paragraph.trim() !== '' ? "mt-6" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-14 pt-8 border-t border-black/10 flex flex-wrap items-center gap-4">
               <LikeButton postId={memory.id} initialCount={likeCount} />
               <CommentModalButton postId={memory.id} initialCount={commentCount} />
            </div>
          </article>
        </div>

        {/* Right Sticky Image Gallery Side */}
        <div className="relative order-first h-[60vh] w-full sm:h-[70vh] lg:order-last lg:h-screen lg:w-1/2 lg:sticky lg:top-0 bg-[#D2CBC0]">
          <MemoryDetailGallery coverImage={memory.cover_image_url} images={memory.post_images ?? []} frameStyle={memory.frame_style} />
        </div>
      </main>
    </div>
  );
}
