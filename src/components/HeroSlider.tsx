"use client";

import { Memory } from "@/src/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_INTERVAL = 5000; // ms per slide

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export function HeroSlider({ memories }: { memories: Memory[] }) {
  const [[currentIndex, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next = (prev + newDirection + memories.length) % memories.length;
        return [next, newDirection];
      });
    },
    [memories.length]
  );

  useEffect(() => {
    if (!memories || memories.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      paginate(1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [memories, isPaused, paginate]);

  if (!memories || memories.length === 0) return null;

  const memory = memories[currentIndex];
  // Use dedicated 16:9 hero crop if available, else fall back to cover
  const heroSrc = memory.hero_image_url || memory.cover_image_url;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#1C1E1F] pt-[72px] sm:pt-[88px] lg:pt-[104px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Container */}
      <div className="relative h-[52svh] min-h-[280px] max-h-[520px] sm:h-[85vh]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 280, damping: 32 },
              opacity: { duration: 0.35 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={heroSrc}
              alt={memory.title || "Featured Memory"}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
              unoptimized
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Caption */}
            {(memory.title || memory.location) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-10 left-6 sm:left-12 text-white drop-shadow-lg"
              >
                {memory.title && (
                  <p className="text-xl sm:text-3xl font-semibold tracking-tight">
                    {memory.title}
                  </p>
                )}
                {memory.location && (
                  <p className="text-xs sm:text-sm opacity-80 mt-1 tracking-widest uppercase">
                    {memory.location}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows — only show if more than 1 slide */}
        {memories.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {memories.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {memories.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() =>
                  setPage(([prev]) => [i, i > prev ? 1 : -1])
                }
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
