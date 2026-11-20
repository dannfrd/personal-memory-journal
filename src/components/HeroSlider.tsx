"use client";

import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { Memory } from "@/src/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_INTERVAL = 5500;

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
  const heroSrc = memory.hero_image_url || memory.cover_image_url;

  return (
    <section
      className="relative w-full bg-[#121417] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Sorotan Memori"
    >
      <div className="relative h-[56svh] min-h-[320px] max-h-[720px] sm:h-[82vh]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 260, damping: 32 },
              opacity: { duration: 0.4 },
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

            {/* Clean subtle bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

            {/* Minimal Clickable Caption */}
            <div className="absolute inset-x-0 bottom-12 z-10 mx-auto max-w-6xl px-6 sm:px-12">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="max-w-2xl text-white"
              >
                <Link href={getMemoryUrl(memory)} className="group inline-block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75 mb-1.5">
                    {memory.location ? `${memory.location} — ` : ""}
                    {formatDate(memory.memory_date)}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight group-hover:underline decoration-white/40 underline-offset-8">
                    {memory.title ||
                      (memory.description.length > 60
                        ? `${memory.description.slice(0, 60)}...`
                        : memory.description)}
                  </h2>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {memories.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Slide sebelumnya"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/20 transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Slide berikutnya"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/20 transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Minimal Dot Indicators */}
        {memories.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
            {memories.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === currentIndex ? "true" : undefined}
                onClick={() => setPage(([prev]) => [i, i > prev ? 1 : -1])}
                className="flex h-6 w-6 items-center justify-center focus-visible:outline-none"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/75"
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
