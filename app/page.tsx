import { EmptyState } from "@/src/components/EmptyState";
import { HeroSlider } from "@/src/components/HeroSlider";
import { IntroSection } from "@/src/components/IntroSection";
import { MemoryIgGrid } from "@/src/components/MemoryIgGrid";
import { Navbar } from "@/src/components/Navbar";
import { fetchMemories } from "@/src/lib/vpsMemoryApi";
import { BookOpen, Heart, Images, MapPin } from "lucide-react";
import Link from "next/link";

import type { Memory } from "@/src/types";

export const revalidate = 30;

export default async function Home() {
  let memories: Memory[] = [];
  let error: Error | null = null;

  try {
    memories = await fetchMemories();
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  const featuredMemories = memories?.slice(0, 5) || [];
  const totalPhotos = memories.reduce(
    (sum, m) => sum + 1 + (m.post_images?.length || 0),
    0
  );
  const totalLikes = memories.reduce(
    (sum, m) => sum + (m.likes?.[0]?.count || 0),
    0
  );
  const uniqueLocations = new Set(
    memories.map((m) => m.location?.trim()).filter(Boolean)
  ).size;

  return (
    <div className="relative min-h-screen font-sans bg-[#F6F3EC] text-[#1F242D] selection:bg-[#1F242D] selection:text-[#F6F3EC]">
      <Navbar />

      <main className="w-full h-full m-0 p-0">
        {/* 1. Hero Showcase */}
        <div id="home" className="scroll-mt-20">
          {featuredMemories.length > 0 && (
            <HeroSlider memories={featuredMemories} />
          )}
        </div>

        {/* 2. Editorial Stats Bar */}
        {!error && memories.length > 0 && (
          <section
            aria-label="Ringkasan Arsip"
            className="relative z-10 border-b border-black/10 bg-[#EFEAE1]/90 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-black/10">
                <div className="flex items-center gap-3.5 pt-2 sm:pt-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F242D]/5 text-[#1F242D]">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1F242D]/55">
                      Cerita Tersimpan
                    </p>
                    <p className="font-serif text-2xl sm:text-3xl font-semibold leading-none mt-0.5">
                      {memories.length} <span className="text-sm font-sans font-normal opacity-65">Memori</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:pl-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F242D]/5 text-[#1F242D]">
                    <Images className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1F242D]/55">
                      Total Bingkai
                    </p>
                    <p className="font-serif text-2xl sm:text-3xl font-semibold leading-none mt-0.5">
                      {totalPhotos} <span className="text-sm font-sans font-normal opacity-65">Foto</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F242D]/5 text-[#1F242D]">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1F242D]/55">
                      Jejak Tempat
                    </p>
                    <p className="font-serif text-2xl sm:text-3xl font-semibold leading-none mt-0.5">
                      {uniqueLocations || 1} <span className="text-sm font-sans font-normal opacity-65">Lokasi</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-900/10 text-rose-800">
                    <Heart className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1F242D]/55">
                      Apresiasi
                    </p>
                    <p className="font-serif text-2xl sm:text-3xl font-semibold leading-none mt-0.5">
                      {totalLikes} <span className="text-sm font-sans font-normal opacity-65">Suka</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Editorial Journal Manifesto */}
        <div id="journal" className="scroll-mt-20">
          <IntroSection memories={memories} />
        </div>

        {error && (
          <div className="py-20 px-8 max-w-5xl mx-auto min-h-[50vh]">
            <div className="rounded-2xl bg-red-50 p-6 text-red-800 border border-red-200 shadow-sm">
              <p className="font-semibold mb-1 text-sm">
                Gagal memuat koleksi memori:
              </p>
              <pre className="text-xs opacity-80">{error.message}</pre>
            </div>
          </div>
        )}

        {/* 4. Interactive Memory Archive (Grid + Filter + View Switcher) */}
        <div id="gallery" className="scroll-mt-20">
          {!error && memories && memories.length > 0 ? (
            <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-28 pt-16">
              <MemoryIgGrid memories={memories} />
            </section>
          ) : !error ? (
            <div className="py-36 px-8 max-w-5xl mx-auto min-h-[50vh] flex items-center justify-center">
              <EmptyState
                title="Kanvas Masih Kosong"
                description="Belum ada kepingan memori yang diabadikan di galeri ini."
              />
            </div>
          ) : null}
        </div>
      </main>

      {/* 5. Editorial Footer */}
      <footer className="border-t border-black/10 bg-[#EFEAE1] text-[#1F242D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-serif text-2xl font-semibold tracking-tight">
              Lovelog &mdash; Personal Memory Journal
            </span>
            <p className="text-xs text-[#1F242D]/60">
              Ruang arsip digital untuk menyimpan setiap momen dan cerita berharga.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-[#1F242D]/70">
            <Link href="/#home" className="hover:text-[#1F242D] transition-colors">
              Home
            </Link>
            <Link href="/#journal" className="hover:text-[#1F242D] transition-colors">
              Journal
            </Link>
            <Link href="/#gallery" className="hover:text-[#1F242D] transition-colors">
              Archive
            </Link>
            <Link href="/admin/login" className="hover:text-[#1F242D] transition-colors">
              Curator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
