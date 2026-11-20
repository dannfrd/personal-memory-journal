"use client";

import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { Memory } from "@/src/types";
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Comments } from "./social/Comments";
import { LikeButton } from "./social/LikeButton";

interface MemoryIgModalProps {
  memory: Memory;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalMemories: number;
}

export function MemoryIgModal({
  memory,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  onClose,
}: MemoryIgModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);

  // All images (cover + post_images)
  const allImages = [
    memory.cover_image_url,
    ...(memory.post_images?.map((img) => img.image_url) || []),
  ];

  // Reset image index when memory changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setShowComments(false);
  }, [memory.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (currentImageIndex > 0) {
          setCurrentImageIndex(currentImageIndex - 1);
        } else if (hasPrevious) {
          onPrevious();
        }
      } else if (e.key === "ArrowRight") {
        if (currentImageIndex < allImages.length - 1) {
          setCurrentImageIndex(currentImageIndex + 1);
        } else if (hasNext) {
          onNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImageIndex, allImages.length, hasPrevious, hasNext, onClose, onPrevious, onNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={memory.title || "Detail Memori"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Close button — 44x44px accessible touch target, no rotation gimmick */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 flex h-11 w-11 items-center justify-center text-white bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full transition-colors duration-200 shadow-xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Tutup modal"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Memory navigation - Previous */}
      {hasPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex h-12 w-12 items-center justify-center text-white bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-full transition-colors duration-200 shadow-2xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Memori sebelumnya"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {/* Memory navigation - Next */}
      {hasNext && (
        <button
          type="button"
          onClick={onNext}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex h-12 w-12 items-center justify-center text-white bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-full transition-colors duration-200 shadow-2xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Memori berikutnya"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {/* Main content */}
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row overflow-hidden">
        {/* Image Section */}
        <div className="relative flex-1 flex items-center justify-center bg-[#0E0F11] p-3 sm:p-6 lg:p-10 min-h-[45vh]">
          <div className="relative w-full h-full max-h-[55vh] lg:max-h-full flex items-center justify-center">
            <Image
              src={allImages[currentImageIndex]}
              alt={memory.title || memory.description}
              fill
              className="object-contain transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 70vw"
              quality={85}
              priority
            />

            {/* Image indicator */}
            {allImages.length > 1 && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/75 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider shadow-lg border border-white/15">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Image navigation dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/15 shadow-xl">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className="flex h-6 w-6 items-center justify-center focus-visible:outline-none"
                    aria-label={`Lihat foto ${idx + 1}`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        idx === currentImageIndex
                          ? "w-5 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image navigation arrows */}
            {allImages.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-white bg-black/60 hover:bg-black/85 backdrop-blur-sm rounded-full transition-colors duration-200 shadow-xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                {currentImageIndex < allImages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-white bg-black/60 hover:bg-black/85 backdrop-blur-sm rounded-full transition-colors duration-200 shadow-xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Section — Warm Editorial Surface matching Lovelog identity */}
        <div className="w-full lg:w-[440px] bg-[#FAF8F5] text-[#2B303A] flex flex-col max-h-[48vh] lg:max-h-full shadow-2xl border-t lg:border-t-0 lg:border-l border-black/10">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-black/10 px-5 py-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#2B303A]/70 font-semibold uppercase tracking-[0.18em]">
                <span className="px-2.5 py-0.5 bg-[#2B303A] text-[#FAF8F5] rounded-full text-[10px]">
                  No. {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span>&bull;</span>
                <span>{formatDate(memory.memory_date)}</span>
              </div>

              {/* Mobile Prev/Next Memory Switcher */}
              <div className="flex items-center gap-1 md:hidden">
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  aria-label="Memori sebelumnya"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#2B303A] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  aria-label="Memori berikutnya"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#2B303A] disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            
            {memory.title && (
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1F242D] leading-snug">
                {memory.title}
              </h2>
            )}

            {memory.location && (
              <div className="flex items-center gap-1.5 text-xs text-[#2B303A]/70 mt-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{memory.location}</span>
              </div>
            )}
          </div>

          {/* Description and Comments - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scroll-smooth">
            <div className="prose prose-sm max-w-none">
              <p className="font-serif text-base sm:text-lg text-[#2B303A]/90 leading-relaxed whitespace-pre-wrap">
                {memory.description}
              </p>
            </div>

            <div className="h-px bg-black/10" />

            {/* Comments Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                aria-expanded={showComments}
                className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2B303A]/80 hover:text-[#2B303A] transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{memory.comments?.[0]?.count || 0} Reflections</span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showComments ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showComments && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Comments postId={memory.id} />
                </div>
              )}
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-black/10 px-5 py-3.5 flex items-center justify-between gap-3">
            <LikeButton
              postId={memory.id}
              initialCount={memory.likes?.[0]?.count || 0}
            />

            <Link
              href={getMemoryUrl(memory)}
              className="flex-1 text-center py-3 px-4 bg-[#2B303A] hover:bg-[#1F242D] text-[#FAF8F5] rounded-full transition-colors text-xs font-bold uppercase tracking-[0.18em] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A]"
            >
              Buka Halaman Penuh
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
