import { EmptyState } from "@/src/components/EmptyState";
import { HeroSlider } from "@/src/components/HeroSlider";
import { IntroSection } from "@/src/components/IntroSection";
import { MemoryIgGrid } from "@/src/components/MemoryIgGrid";
import { Navbar } from "@/src/components/Navbar";
import { fetchMemories } from "@/src/lib/vpsMemoryApi";
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

        {/* 2. Editorial Journal Quote + Transparent Collage */}
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

        {/* 3. Memory Gallery */}
        <div id="gallery" className="scroll-mt-20">
          {!error && memories && memories.length > 0 ? (
            <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-28 pt-14">
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

      {/* 4. Minimal Footer */}
      <footer className="border-t border-black/10 bg-[#EFEAE1]/70 text-[#1F242D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#1F242D]/60">
          <span className="font-serif text-lg font-semibold text-[#1F242D]">
            Lovelog &mdash; Memory Journal
          </span>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/#home" className="hover:text-[#1F242D] transition-colors">
              Home
            </Link>
            <Link href="/#journal" className="hover:text-[#1F242D] transition-colors">
              Journal
            </Link>
            <Link href="/#gallery" className="hover:text-[#1F242D] transition-colors">
              Gallery
            </Link>
            <Link href="/admin/login" className="hover:text-[#1F242D] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
