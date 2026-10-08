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
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalMemories,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-in fade-in duration-300">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Memory navigation - Previous */}
      {hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
          aria-label="Previous memory"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Memory navigation - Next */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
          aria-label="Next memory"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Main content */}
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="relative flex-1 flex items-center justify-center bg-black p-4 lg:p-8">
          <div className="relative w-full h-full max-h-[70vh] lg:max-h-full flex items-center justify-center">
            <Image
              src={allImages[currentImageIndex]}
              alt={memory.title || memory.description}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
            />

            {/* Image indicator */}
            {allImages.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            )}

            {/* Image navigation dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image navigation arrows (mobile) */}
            {allImages.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}
                {currentImageIndex < allImages.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-[420px] bg-white flex flex-col max-h-[30vh] lg:max-h-full">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                <span>Memory {currentIndex + 1}</span>
                <span>•</span>
                <span>{formatDate(memory.memory_date)}</span>
              </div>
            </div>
            
            {memory.title && (
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-1">
                {memory.title}
              </h2>
            )}

            {memory.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-2">
                <MapPin className="h-4 w-4" />
                <span>{memory.location}</span>
              </div>
            )}
          </div>

          {/* Description and Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {memory.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{memory.comments?.[0]?.count || 0} Reflections</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      showComments ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>

              {showComments && (
                <div className="space-y-3">
                  <Comments postId={memory.id} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <LikeButton
                postId={memory.id}
                initialCount={memory.likes?.[0]?.count || 0}
              />
            </div>

            {/* View full button */}
            <Link
              href={`/memories/${memory.id}`}
              className="block w-full text-center py-2.5 px-4 bg-[#2B303A] text-white rounded-lg hover:bg-[#1a1d24] transition-colors text-sm font-medium"
            >
              View Full Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile memory navigation hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs lg:hidden">
        Swipe or use arrows to navigate
      </div>
    </div>
  );
}
