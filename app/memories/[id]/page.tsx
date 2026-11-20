import { MemoryDetailGallery } from "@/src/components/MemoryDetailGallery";
import { Navbar } from "@/src/components/Navbar";
import { CommentModalButton } from "@/src/components/social/CommentModalButton";
import { Comments } from "@/src/components/social/Comments";
import { LikeButton } from "@/src/components/social/LikeButton";
import { ShareButton } from "@/src/components/social/ShareButton";
import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { fetchMemories, fetchMemoryById } from "@/src/lib/vpsMemoryApi";
import type { Memory } from "@/src/types";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Images,
  MapPin,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
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
      ? `${memory.title} — Lovelog Memory Journal`
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
  const photoCount = 1 + (memory.post_images?.length || 0);

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

      <main className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        {/* Top Breadcrumb & Chapter Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
          <Link
            href="/#gallery"
            className="group inline-flex min-h-[40px] items-center gap-2.5 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase text-[#1F242D] shadow-sm transition-all hover:bg-[#1F242D] hover:text-[#F6F3EC]"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>Kembali ke Arsip</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#1F242D]/60">
            {currentIdx >= 0 && (
              <span className="rounded-full bg-[#EFEAE1] px-3 py-1.5 text-[#1F242D]">
                Lembaran No. {String(currentIdx + 1).padStart(2, "0")} dari{" "}
                {String(allMemories.length).padStart(2, "0")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-black/10 px-3 py-1.5 text-[#1F242D]">
              <Images className="h-3.5 w-3.5" aria-hidden="true" />
              {photoCount} Foto
            </span>
          </div>
        </div>

        {/* Main Split Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Sticky Interactive Showcase (7 cols) */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="relative h-[56vh] sm:h-[68vh] lg:h-[76vh] w-full overflow-hidden rounded-3xl border border-black/10 bg-[#181A1D] shadow-2xl">
              <MemoryDetailGallery
                coverImage={memory.cover_image_url}
                images={memory.post_images ?? []}
                frameStyle={memory.frame_style}
              />
            </div>
          </div>

          {/* Right Editorial Story Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <article className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
              {/* Metadata Pills */}
              <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F3EC] px-3 py-1.5 text-[#1F242D]/80 border border-black/10">
                  <Calendar className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                  {formatDate(memory.memory_date)}
                </span>
                {memory.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F3EC] px-3 py-1.5 text-[#1F242D]/80 border border-black/10">
                    <MapPin className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                    {memory.location}
                  </span>
                )}
                {memory.mood && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/10 px-3 py-1.5 text-amber-900 border border-amber-900/20">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {memory.mood}
                  </span>
                )}
              </div>

              {/* Story Title */}
              <h1 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.12] tracking-tight text-[#1F242D]">
                {memory.title || "Sepotong Kenangan"}
              </h1>

              <div className="mb-8 h-px w-16 bg-amber-900/40" />

              {/* Story Body with Editorial Drop-Cap on first paragraph */}
              <div className="font-serif text-xl sm:text-2xl leading-[1.75] text-[#1F242D]/90 space-y-6">
                {paragraphs.map((paragraph: string, idx: number) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:leading-none first-letter:text-amber-900"
                        : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Action Bar */}
              <div className="mt-10 pt-6 border-t border-black/10 flex flex-wrap items-center gap-3">
                <LikeButton postId={memory.id} initialCount={likeCount} />
                <CommentModalButton
                  postId={memory.id}
                  initialCount={commentCount}
                />
                <ShareButton memory={memory} />
              </div>
            </article>

            {/* Inline Reflections Card */}
            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
              <Comments postId={memory.id} />
            </div>
          </div>
        </div>

        {/* Previous / Next Memory Chapter Navigation */}
        {(prevMemory || nextMemory) && (
          <section
            aria-label="Navigasi Memori Lainnya"
            className="mt-16 pt-10 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {prevMemory ? (
              <Link
                href={getMemoryUrl(prevMemory)}
                className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E5DEC9]">
                  <Image
                    src={prevMemory.cover_image_url}
                    alt={prevMemory.title || "Memori Sebelumnya"}
                    fill
                    sizes="80px"
                    quality={65}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F242D]/55">
                    <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                    Memori Sebelumnya
                  </span>
                  <p className="mt-1 font-serif text-xl font-semibold text-[#1F242D] truncate">
                    {prevMemory.title || prevMemory.description}
                  </p>
                  <p className="text-xs text-[#1F242D]/55">
                    {formatDate(prevMemory.memory_date)}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextMemory ? (
              <Link
                href={getMemoryUrl(nextMemory)}
                className="group flex items-center justify-end gap-4 rounded-2xl border border-black/10 bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F242D]/55">
                    Memori Berikutnya
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <p className="mt-1 font-serif text-xl font-semibold text-[#1F242D] truncate">
                    {nextMemory.title || nextMemory.description}
                  </p>
                  <p className="text-xs text-[#1F242D]/55">
                    {formatDate(nextMemory.memory_date)}
                  </p>
                </div>
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E5DEC9]">
                  <Image
                    src={nextMemory.cover_image_url}
                    alt={nextMemory.title || "Memori Berikutnya"}
                    fill
                    sizes="80px"
                    quality={65}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
