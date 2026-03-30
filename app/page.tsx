import prisma from "@/src/lib/prisma";
import { Navbar } from "@/src/components/Navbar";
import { MemoryGrid } from "@/src/components/MemoryGrid";
import { EmptyState } from "@/src/components/EmptyState";
import { HeroSlider } from "@/src/components/HeroSlider";
import { IntroSection } from "@/src/components/IntroSection";

import type { Memory } from "@/src/types";

export const revalidate = 0;

export default async function Home() {
  let memories: Memory[] = [];
  let error: Error | null = null;
  
  try {
    const rawMemories = await prisma.memory.findMany({
      orderBy: { memory_date: 'desc' },
      include: {
        images: { select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    memories = rawMemories.map((m) => ({
      ...m,
      memory_date: m.memory_date instanceof Date ? m.memory_date.toISOString() : String(m.memory_date),
      created_at: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
      updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : String(m.updatedAt),
      post_images: m.images.map((img: { imageUrl: string }) => ({ image_url: img.imageUrl })),
      likes: [{ count: m._count.likes }],
      comments: [{ count: m._count.comments }]
    })) as unknown as Memory[];
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  const featuredMemories = memories?.slice(0, 5) || [];

  return (
    <div className="relative min-h-screen font-sans bg-[#EAE5DF] text-[#2B303A] selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="w-full h-full m-0 p-0">
        {featuredMemories.length > 0 && <HeroSlider memories={featuredMemories} />}
        <IntroSection />

        {error && (
          <div className="py-20 px-8 max-w-5xl mx-auto min-h-[50vh]">
            <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200 shadow-sm">
              <p className="font-medium mb-1">Failed to load memories:</p>
              <pre className="text-xs">{error.message}</pre>
            </div>
          </div>
        )}

        {!error && memories && memories.length > 0 ? (
          <MemoryGrid memories={memories} />
        ) : !error ? (
          <div className="py-40 px-8 max-w-5xl mx-auto min-h-[50vh] flex items-center justify-center">
            <EmptyState 
              title="Blank Canvas"
              description="Your gallery is beautifully empty. Head to the hidden route to begin."
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
