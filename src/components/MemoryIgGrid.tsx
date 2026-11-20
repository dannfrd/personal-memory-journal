"use client";

import { formatDate } from "@/src/lib/utils";
import { Memory } from "@/src/types";
import {
  ArrowUpRight,
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
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

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

// 1. Editorial Card Mode (Rich Magazine Cards with Title, Date, Location, Likes/Comments)
const MemoryEditorialCard = memo(function MemoryEditorialCard({
  memory,
  index,
  onSelect,
}: MemoryGridTileProps) {
  const likeCount = memory.likes?.[0]?.count || 0;
  const commentCount = memory.comments?.[0]?.count || 0;
  const photoCount = (memory.post_images?.length || 0) + 1;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Photo Thumbnail Container */}
      <button
        type="button"
        onClick={() => onSelect(memory.id)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5DEC9] text-left focus:outline-none"
      >
        <Image
          src={memory.cover_image_url}
          alt={memory.title || memory.description}
          fill
          className="object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          quality={78}
          priority={index < 3}
          loading={index < 3 ? "eager" : "lazy"}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white border border-white/15">
            No. {String(index + 1).padStart(2, "0")}
          </span>

          {photoCount > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/15">
              <Images className="h-3 w-3" aria-hidden="true" />
              <span>{photoCount}</span>
            </span>
          )}
        </div>

        {/* Bottom Location / Mood Tag on Image */}
        {(memory.location || memory.mood) && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 text-white">
            {memory.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase border border-white/20">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[180px]">{memory.location}</span>
              </span>
            )}
            {memory.mood && (
              <span className="rounded-full bg-amber-900/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase border border-white/15">
                {memory.mood}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Editorial Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1F242D]/55">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{formatDate(memory.memory_date)}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(memory.id)}
            className="block text-left focus:outline-none group/title"
          >
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1F242D] leading-snug group-hover/title:text-amber-900 transition-colors line-clamp-1">
              {memory.title || "Sepotong Kenangan"}
            </h3>
          </button>

          <p className="mt-2 line-clamp-2 text-sm text-[#1F242D]/70 leading-relaxed">
            {memory.description}
          </p>
        </div>

        {/* Card Footer: Social Counts & Full Story Link */}
        <div className="mt-5 pt-4 border-t border-black/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-xs font-semibold text-[#1F242D]/65">
            <button
              type="button"
              onClick={() => onSelect(memory.id)}
              className="inline-flex items-center gap-1.5 hover:text-rose-700 transition-colors"
              aria-label={`${likeCount} suka`}
            >
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelect(memory.id)}
              className="inline-flex items-center gap-1.5 hover:text-[#1F242D] transition-colors"
              aria-label={`${commentCount} refleksi`}
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{commentCount}</span>
            </button>
          </div>

          <Link
            href={`/memories/${memory.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F242D] hover:text-amber-900 transition-colors"
          >
            <span>Baca Cerita</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
});

// 2. Compact Square Grid Tile (Instagram Archive View)
const MemoryCompactTile = memo(function MemoryCompactTile({
  memory,
  index,
  onSelect,
}: MemoryGridTileProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(memory.id)}
      className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#D2CBC0] to-[#C4B7AB] group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
    >
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="text-white space-y-1 text-left">
          <h3 className="font-serif text-xs sm:text-base font-bold line-clamp-1 drop-shadow">
            {memory.title || memory.description}
          </h3>
          <div className="flex items-center gap-1.5 text-[9px] sm:text-xs opacity-90">
            <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{formatDate(memory.memory_date)}</span>
          </div>
        </div>
      </div>

      {memory.post_images && memory.post_images.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow border border-white/20">
          <Images className="h-3 w-3" aria-hidden="true" />
          <span>{memory.post_images.length + 1}</span>
        </div>
      )}
    </button>
  );
});

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

export function MemoryIgGrid({ memories }: MemoryIgGridProps) {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [viewMode, setViewMode] = useState<"editorial" | "compact">("editorial");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("ALL");

  // Extract unique moods / locations for filter pills
  const filterTags = useMemo(() => {
    const tags = new Set<string>();
    memories.forEach((m) => {
      if (m.mood?.trim()) tags.add(m.mood.trim());
    });
    return Array.from(tags).slice(0, 6);
  }, [memories]);

  // Filtered memories based on search & mood
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesMood =
        selectedMood === "ALL" ||
        m.mood?.toLowerCase() === selectedMood.toLowerCase();

      if (!matchesMood) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        m.title?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.mood?.toLowerCase().includes(q)
      );
    });
  }, [memories, searchQuery, selectedMood]);

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
      {/* Editorial Section Header + Interactive Toolbar */}
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-900">
              Curated Collection
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1F242D]">
              Galeri &amp; Lembaran Memori
            </h2>
          </div>

          {/* View Mode Switcher (Editorial Cards vs Compact Grid) */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("editorial")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                  viewMode === "editorial"
                    ? "bg-[#1F242D] text-[#F6F3EC] shadow-sm"
                    : "text-[#1F242D]/65 hover:text-[#1F242D]"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Editorial</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                  viewMode === "compact"
                    ? "bg-[#1F242D] text-[#F6F3EC] shadow-sm"
                    : "text-[#1F242D]/65 hover:text-[#1F242D]"
                }`}
              >
                <Grid className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Grid Foto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Mood Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/80 backdrop-blur-md p-3 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1F242D]/45"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, cerita, lokasi, atau suasana..."
              aria-label="Cari memori"
              className="w-full rounded-xl bg-[#F6F3EC]/80 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1F242D] placeholder:text-[#1F242D]/45 border border-transparent focus:border-[#1F242D]/25 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#1F242D]/50 hover:text-[#1F242D]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Mood Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedMood("ALL")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all ${
                selectedMood === "ALL"
                  ? "bg-[#1F242D] text-[#F6F3EC]"
                  : "bg-[#F6F3EC] text-[#1F242D]/70 hover:bg-black/10"
              }`}
            >
              Semua ({memories.length})
            </button>
            {filterTags.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all ${
                  selectedMood === mood
                    ? "bg-amber-900 text-white"
                    : "bg-[#F6F3EC] text-[#1F242D]/70 hover:bg-black/10"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty Search Result State */}
      {filteredMemories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 py-16 px-6 text-center">
          <p className="font-serif text-2xl text-[#1F242D]">
            Tidak ada memori yang cocok dengan filter tersebut.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedMood("ALL");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1F242D] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white"
          >
            Reset Pencarian
          </button>
        </div>
      ) : viewMode === "editorial" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleMemories.map((memory, index) => (
            <MemoryEditorialCard
              key={memory.id}
              memory={memory}
              index={index}
              onSelect={handleSelectById}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {visibleMemories.map((memory, index) => (
            <MemoryCompactTile
              key={memory.id}
              memory={memory}
              index={index}
              onSelect={handleSelectById}
            />
          ))}
        </div>
      )}

      {/* Progressive Load More Button */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#1F242D]/20 bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#1F242D] shadow-sm transition-all hover:bg-[#1F242D] hover:text-white"
          >
            <span>
              Tampilkan Lebih Banyak ({filteredMemories.length - visibleCount} lagi)
            </span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
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
