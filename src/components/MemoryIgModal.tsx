"use client";

import { formatDate } from "@/src/lib/utils";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110 shadow-xl border border-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Memory navigation - Previous */}
      {hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110 shadow-2xl border border-white/20 hidden md:flex items-center justify-center"
          aria-label="Previous memory"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>
      )}

      {/* Memory navigation - Next */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110 shadow-2xl border border-white/20 hidden md:flex items-center justify-center"
          aria-label="Next memory"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>
      )}

      {/* Main content */}
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="relative flex-1 flex items-center justify-center bg-black p-3 sm:p-4 lg:p-8">
          <div className="relative w-full h-full max-h-[60vh] lg:max-h-full flex items-center justify-center">
            <Image
              src={allImages[currentImageIndex]}
              alt={memory.title || memory.description}
              fill
              className="object-contain transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
            />

            {/* Image indicator */}
            {allImages.length > 1 && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-md text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-2xl border border-white/30">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            )}

            {/* Image navigation dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 px-3 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentImageIndex
                        ? "w-6 sm:w-8 h-1.5 bg-white shadow-lg shadow-white/50"
                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60 hover:scale-125"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image navigation arrows */}
            {allImages.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 shadow-xl border border-white/20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}
                {currentImageIndex < allImages.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 shadow-xl border border-white/20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-[420px] bg-white/95 backdrop-blur-md flex flex-col max-h-[40vh] lg:max-h-full shadow-2xl">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/50 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">
                <span className="px-2 py-0.5 bg-[#2B303A] text-white rounded-full">
                  Memory {currentIndex + 1}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{formatDate(memory.memory_date)}</span>
              </div>
            </div>
            
            {memory.title && (
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900 mb-1 leading-tight">
                {memory.title}
              </h2>
            )}

            {memory.location && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{memory.location}</span>
              </div>
            )}
          </div>

          {/* Description and Comments - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scroll-smooth">
            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {memory.description}
              </p>
            </div>

            {/* Divider with gradient */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Comments Section */}
            <div className="space-y-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 hover:gap-3 group"
              >
                <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>{memory.comments?.[0]?.count || 0} Reflections</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-300 ${
                    showComments ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showComments && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Comments postId={memory.id} />
                </div>
              )}
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 p-3 sm:p-4 space-y-3 shadow-lg">
            {/* Action buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <LikeButton
                postId={memory.id}
                initialCount={memory.likes?.[0]?.count || 0}
              />
            </div>

            {/* View full button */}
            <Link
              href={`/memories/${memory.id}`}
              className="block w-full text-center py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#2B303A] to-[#1a1d24] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-sm font-medium shadow-md"
            >
              View Full Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile navigation hint */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-[10px] sm:text-xs lg:hidden bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        Use arrows to navigate
      </div>
    </div>
  );
}
