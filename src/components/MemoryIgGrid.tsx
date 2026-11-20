"use client";

import { formatDate } from "@/src/lib/utils";
import { Memory } from "@/src/types";
import { Calendar, ChevronDown, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useCallback, useState } from "react";

// FE-04: Code splitting & dynamic import for the heavy modal + social bundle
const MemoryIgModal = dynamic(
  () => import("./MemoryIgModal").then((mod) => mod.MemoryIgModal),
  { ssr: false }
);

interface MemoryIgGridProps {
  memories: Memory[];
}

interface MemoryGridTileProps {
  memory: Memory;
  index: number;
  onSelect: (index: number) => void;
}

// FE-01 & FE-07: Memoized tile with CSS-only hover state (eliminates whole-grid re-renders on hover)
const MemoryGridTile = memo(function MemoryGridTile({
  memory,
  index,
  onSelect,
}: MemoryGridTileProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#D2CBC0] to-[#C4B7AB] group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAE5DF] rounded-sm shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* IMG-01, IMG-02, IMG-03, IMG-04: Responsive WebP/AVIF thumbnail + lazy loading */}
      <Image
        src={memory.cover_image_url}
        alt={memory.title || memory.description}
        fill
        className="object-cover will-change-transform transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 340px"
        quality={75}
        priority={index < 3}
        loading={index < 3 ? "eager" : "lazy"}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Info overlay on hover — pure CSS group-hover, zero React state re-render */}
      <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-3 md:p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="text-white space-y-0.5 sm:space-y-1 md:space-y-1.5 text-left">
          {memory.title && (
            <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold line-clamp-2 drop-shadow-lg leading-tight">
              {memory.title}
            </h3>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs opacity-90">
            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
            <span className="drop-shadow truncate">{formatDate(memory.memory_date)}</span>
          </div>
          {memory.location && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs opacity-90">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
              <span className="drop-shadow line-clamp-1">{memory.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Multiple images indicator */}
      {memory.post_images && memory.post_images.length > 0 && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg border border-white/20 transition-transform duration-300 group-hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow sm:w-3 sm:h-3"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{memory.post_images.length + 1}</span>
        </div>
      )}

      {/* Corner accents - hidden on very small screens */}
      <div className="hidden sm:block absolute top-0 left-0 w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/0 group-hover:border-white/30 transition-colors duration-300 rounded-tl-sm" />
      <div className="hidden sm:block absolute bottom-0 right-0 w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/0 group-hover:border-white/30 transition-colors duration-300 rounded-br-sm" />
    </button>
  );
});

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

export function MemoryIgGrid({ memories }: MemoryIgGridProps) {
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const handleSelect = useCallback((index: number) => {
    setSelectedMemoryIndex(index);
  }, []);

  const visibleMemories = memories.slice(0, visibleCount);
  const hasMore = visibleCount < memories.length;

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {visibleMemories.map((memory, index) => (
          <MemoryGridTile
            key={memory.id}
            memory={memory}
            index={index}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* FE-02 & IMG-04: Progressive lazy loading for large memory galleries */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
            className="inline-flex items-center gap-2 rounded-full border border-[#2B303A]/20 bg-white/60 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#2B303A] shadow-sm backdrop-blur-sm transition-all hover:bg-[#2B303A] hover:text-white"
          >
            <span>Muat Lebih Banyak ({memories.length - visibleCount} lagi)</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedMemoryIndex !== null && (
        <MemoryIgModal
          memory={memories[selectedMemoryIndex]}
          onClose={() => setSelectedMemoryIndex(null)}
          onPrevious={() => {
            if (selectedMemoryIndex > 0) {
              setSelectedMemoryIndex(selectedMemoryIndex - 1);
            }
          }}
          onNext={() => {
            if (selectedMemoryIndex < memories.length - 1) {
              setSelectedMemoryIndex(selectedMemoryIndex + 1);
            }
          }}
          hasPrevious={selectedMemoryIndex > 0}
          hasNext={selectedMemoryIndex < memories.length - 1}
          currentIndex={selectedMemoryIndex}
          totalMemories={memories.length}
        />
      )}
    </>
  );
}
