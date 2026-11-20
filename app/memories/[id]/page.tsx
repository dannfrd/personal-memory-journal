import { MemoryDetailGallery } from "@/src/components/MemoryDetailGallery";
import { Navbar } from "@/src/components/Navbar";
import { CommentModalButton } from "@/src/components/social/CommentModalButton";
import { LikeButton } from "@/src/components/social/LikeButton";
import { ShareButton } from "@/src/components/social/ShareButton";
import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { fetchMemories, fetchMemoryById } from "@/src/lib/vpsMemoryApi";
import type { Memory } from "@/src/types";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const memory = await fetchMemoryById(id);
    if (!memory) {
      return { title: "Memori Tidak Ditemukan — Lovelog" };
    }
    const title = memory.title
      ? `${memory.title} — Lovelog`
      : `Memori ${formatDate(memory.memory_date)} — Lovelog`;
    const description =
      memory.description.length > 160
        ? `${memory.description.slice(0, 157)}...`
        : memory.description;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: memory.cover_image_url ? [{ url: memory.cover_image_url }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: memory.cover_image_url ? [memory.cover_image_url] : [],
      },
    };
  } catch {
    return { title: "Lovelog — Personal Memory Journal" };
  }
}

export default async function MemoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let memory: Memory | null = null;
  let allMemories: Memory[] = [];
  let error: unknown = null;

  try {
    [memory, allMemories] = await Promise.all([
      fetchMemoryById(id),
      fetchMemories(),
    ]);
  } catch (err) {
    error = err;
  }

  if (error || !memory) {
    notFound();
  }

  const likeCount = memory.likes?.[0]?.count || 0;
  const commentCount = memory.comments?.[0]?.count || 0;

  const currentIdx = allMemories.findIndex((m) => m.id === memory?.id);
  const prevMemory = currentIdx > 0 ? allMemories[currentIdx - 1] : null;
  const nextMemory =
    currentIdx >= 0 && currentIdx < allMemories.length - 1
      ? allMemories[currentIdx + 1]
      : null;

  const paragraphs = memory.description
    .split("\n")
    .filter((p) => p.trim() !== "");

  return (
    <div className="min-h-screen font-sans bg-[#F6F3EC] text-[#1F242D] selection:bg-[#1F242D] selection:text-[#F6F3EC]">
      <Navbar />

      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Left Clean Story Column */}
        <div className="relative z-10 flex w-full flex-col justify-between px-6 py-12 sm:px-14 sm:py-20 lg:w-1/2 lg:px-20 xl:px-28 bg-[#F6F3EC]">
          <div>
            <Link
              href="/#gallery"
              className="group mb-12 inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.2em] uppercase text-[#1F242D]/60 hover:text-[#1F242D] transition-colors"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              <span>Kembali ke Galeri</span>
            </Link>

            <article className="max-w-[60ch]">
              {/* Minimal Inline Metadata */}
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#1F242D]/60">
                <span>{formatDate(memory.memory_date)}</span>
                {memory.location && (
                  <>
                    <span>&bull;</span>
                    <span>{memory.location}</span>
                  </>
                )}
                {memory.mood && (
                  <>
                    <span>&bull;</span>
                    <span>{memory.mood}</span>
                  </>
                )}
              </div>

              {memory.title && (
                <h1 className="mb-8 font-serif text-4xl sm:text-5xl font-medium leading-[1.15] tracking-tight text-[#1F242D]">
                  {memory.title}
                </h1>
              )}

              <div className="font-serif text-xl sm:text-2xl leading-[1.75] text-[#1F242D]/90 space-y-6">
                {paragraphs.map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Action Bar */}
              <div className="mt-12 pt-8 border-t border-black/10 flex flex-wrap items-center gap-3">
                <LikeButton postId={memory.id} initialCount={likeCount} />
                <CommentModalButton
                  postId={memory.id}
                  initialCount={commentCount}
                />
                <ShareButton memory={memory} />
              </div>
            </article>
          </div>

          {/* Subtle Prev / Next Links */}
          {(prevMemory || nextMemory) && (
            <div className="mt-14 pt-6 border-t border-black/10 flex items-center justify-between gap-4 text-xs font-semibold text-[#1F242D]/65">
              {prevMemory ? (
                <Link
                  href={getMemoryUrl(prevMemory)}
                  className="inline-flex items-center gap-2 hover:text-[#1F242D] transition-colors truncate max-w-[45%]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {prevMemory.title || formatDate(prevMemory.memory_date)}
                  </span>
                </Link>
              ) : (
                <span />
              )}

              {nextMemory ? (
                <Link
                  href={getMemoryUrl(nextMemory)}
                  className="inline-flex items-center gap-2 hover:text-[#1F242D] transition-colors truncate max-w-[45%]"
                >
                  <span className="truncate">
                    {nextMemory.title || formatDate(nextMemory.memory_date)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Sticky Full-Height Photo Showcase */}
        <div className="relative order-first h-[58vh] w-full sm:h-[68vh] lg:order-last lg:h-[calc(100vh-4rem)] lg:w-1/2 lg:sticky lg:top-16 bg-[#181A1D]">
          <MemoryDetailGallery
            coverImage={memory.cover_image_url}
            images={memory.post_images ?? []}
            frameStyle={memory.frame_style}
          />
        </div>
      </main>
    </div>
  );
}
