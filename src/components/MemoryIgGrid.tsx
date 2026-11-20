"use client";

import { formatDate } from "@/src/lib/utils";
import { Memory } from "@/src/types";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Grid,
  Heart,
  Images,
  MapPin,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import { ShareButton } from "./social/ShareButton";

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
  onSelect: (memoryId: string) => void;
}

// 1. Clean Photo Grid Tile (Default — High Focus on Photography, Low Visual Noise)
const MemoryCompactTile = memo(function MemoryCompactTile({
  memory,
  index,
  onSelect,
}: MemoryGridTileProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(memory.id)}
      className="relative aspect-square overflow-hidden bg-[#E5DEC9] group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D] rounded-xl shadow-xs hover:shadow-lg transition-all duration-300"
    >
      <Image
        src={memory.cover_image_url}
        alt={memory.title || memory.description}
        fill
        className="object-cover will-change-transform transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 360px"
        quality={78}
        priority={index < 3}
        loading={index < 3 ? "eager" : "lazy"}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="text-white space-y-0.5 text-left">
          <h3 className="font-serif text-sm sm:text-lg font-medium line-clamp-1 drop-shadow">
            {memory.title || memory.description}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/85">
            <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{formatDate(memory.memory_date)}</span>
          </div>
        </div>
      </div>

      {memory.post_images && memory.post_images.length > 0 && (
        <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
          <Images className="h-3 w-3" aria-hidden="true" />
          <span>{memory.post_images.length + 1}</span>
        </div>
      )}
    </button>
  );
});

// 2. Clean Editorial Story Card (Secondary View)
const MemoryEditorialCard = memo(function MemoryEditorialCard({
  memory,
  index,
  onSelect,
}: MemoryGridTileProps) {
  const likeCount = memory.likes?.[0]?.count || 0;
  const commentCount = memory.comments?.[0]?.count || 0;
  const photoCount = (memory.post_images?.length || 0) + 1;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs transition-all duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => onSelect(memory.id)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5DEC9] text-left focus:outline-none"
      >
        <Image
          src={memory.cover_image_url}
          alt={memory.title || memory.description}
          fill
          className="object-cover will-change-transform transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          quality={78}
          priority={index < 3}
          loading={index < 3 ? "eager" : "lazy"}
        />
        {photoCount > 1 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white">
            <Images className="h-3 w-3" aria-hidden="true" />
            <span>{photoCount}</span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-[#1F242D]/55">
            <span>{formatDate(memory.memory_date)}</span>
            {memory.location && (
              <>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {memory.location}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(memory.id)}
            className="block text-left focus:outline-none"
          >
            <h3 className="font-serif text-xl font-semibold text-[#1F242D] leading-snug line-clamp-1">
              {memory.title || "Sepotong Kenangan"}
            </h3>
          </button>

          <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-[#1F242D]/65 leading-relaxed">
            {memory.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#1F242D]/60">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              {likeCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {commentCount}
            </span>
          </div>
          <ShareButton memory={memory} variant="icon" />
        </div>
      </div>
    </article>
  );
});

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

export function MemoryIgGrid({ memories }: MemoryIgGridProps) {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [viewMode, setViewMode] = useState<"compact" | "editorial">("compact");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const q = searchQuery.toLowerCase();
    return memories.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.mood?.toLowerCase().includes(q)
    );
  }, [memories, searchQuery]);

  const handleSelectById = useCallback((memoryId: string) => {
    setSelectedMemoryId(memoryId);
  }, []);

  const selectedMemoryIndex = useMemo(() => {
    if (!selectedMemoryId) return null;
    const idx = filteredMemories.findIndex((m) => m.id === selectedMemoryId);
    return idx >= 0 ? idx : null;
  }, [filteredMemories, selectedMemoryId]);

  const visibleMemories = filteredMemories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMemories.length;

  return (
    <div>
      {/* Clean Minimal Toolbar: Count + Search + View Toggle */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
        <div>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-[#1F242D]">
            Galeri Kenangan
          </h2>
          <p className="text-xs text-[#1F242D]/55 mt-0.5">
            {memories.length} memori tersimpan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Minimal Search Input */}
          <div className="relative w-full sm:w-60">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1F242D]/45"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari memori..."
              aria-label="Cari memori"
              className="w-full rounded-full bg-white pl-9 pr-8 py-2 text-xs text-[#1F242D] placeholder:text-[#1F242D]/45 border border-black/10 focus:border-[#1F242D]/40 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1F242D]/45 hover:text-[#1F242D]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Simple View Toggle Icon Pill */}
          <div className="inline-flex shrink-0 items-center rounded-full border border-black/10 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              aria-label="Tampilan Grid Foto"
              title="Grid Foto"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                viewMode === "compact"
                  ? "bg-[#1F242D] text-[#F6F3EC]"
                  : "text-[#1F242D]/55 hover:text-[#1F242D]"
              }`}
            >
              <Grid className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editorial")}
              aria-label="Tampilan Kartu Cerita"
              title="Kartu Cerita"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                viewMode === "editorial"
                  ? "bg-[#1F242D] text-[#F6F3EC]"
                  : "text-[#1F242D]/55 hover:text-[#1F242D]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {filteredMemories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 py-14 px-6 text-center">
          <p className="font-serif text-xl text-[#1F242D]/75">
            Tidak ditemukan memori untuk &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : viewMode === "compact" ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
          {visibleMemories.map((memory, index) => (
            <MemoryCompactTile
              key={memory.id}
              memory={memory}
              index={index}
              onSelect={handleSelectById}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleMemories.map((memory, index) => (
            <MemoryEditorialCard
              key={memory.id}
              memory={memory}
              index={index}
              onSelect={handleSelectById}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-2.5 text-xs font-semibold text-[#1F242D] transition-colors hover:bg-[#1F242D] hover:text-white"
          >
            <span>Lihat Lebih Banyak</span>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedMemoryIndex !== null && filteredMemories[selectedMemoryIndex] && (
        <MemoryIgModal
          memory={filteredMemories[selectedMemoryIndex]}
          onClose={() => setSelectedMemoryId(null)}
          onPrevious={() => {
            if (selectedMemoryIndex > 0) {
              setSelectedMemoryId(filteredMemories[selectedMemoryIndex - 1].id);
            }
          }}
          onNext={() => {
            if (selectedMemoryIndex < filteredMemories.length - 1) {
              setSelectedMemoryId(filteredMemories[selectedMemoryIndex + 1].id);
            }
          }}
          hasPrevious={selectedMemoryIndex > 0}
          hasNext={selectedMemoryIndex < filteredMemories.length - 1}
          currentIndex={selectedMemoryIndex}
          totalMemories={filteredMemories.length}
        />
      )}
    </div>
  );
}
