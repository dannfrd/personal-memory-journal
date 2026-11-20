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
      className="relative w-full bg-[#1C1E1F]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Sorotan Memori"
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
              priority={currentIndex === 0}
              quality={85}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

            {/* Caption */}
            {(memory.title || memory.location) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.45 }}
                className="absolute bottom-14 left-6 right-6 sm:bottom-16 sm:left-12 sm:right-12 max-w-3xl text-white drop-shadow-md"
              >
                {memory.location && (
                  <p className="text-[11px] sm:text-xs font-semibold opacity-85 mb-2 tracking-[0.28em] uppercase">
                    {memory.location}
                  </p>
                )}
                {memory.title && (
                  <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
                    {memory.title}
                  </h2>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows — minimum 44x44px touch targets & keyboard focus ring */}
        {memories.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Slide sebelumnya"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md border border-white/25 transition-all hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Slide berikutnya"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md border border-white/25 transition-all hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Dot indicators — wrapped in 32x32px hit area for mobile ergonomics */}
        {memories.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {memories.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === currentIndex ? "true" : undefined}
                onClick={() =>
                  setPage(([prev]) => [i, i > prev ? 1 : -1])
                }
                className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/45 hover:bg-white/75"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
