"use client";

import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { Memory } from "@/src/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const SLIDE_INTERVAL = 6000;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98,
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
      aria-label="Sorotan Memori Utama"
    >
      <div className="relative h-[62svh] min-h-[380px] max-h-[760px] sm:h-[82vh]">
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
              opacity: { duration: 0.45 },
              scale: { duration: 0.6 },
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

            {/* Multi-layered cinematic editorial gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Editorial Caption & Action Box */}
            <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl px-6 pb-14 sm:px-12 sm:pb-16 lg:px-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl text-white"
              >
                {/* Chapter & Metadata Pill */}
                <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/85">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1">
                    Featured {String(currentIndex + 1).padStart(2, "0")} / {String(memories.length).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                    {formatDate(memory.memory_date)}
                  </span>
                  {memory.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                      {memory.location}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.08] drop-shadow-sm">
                  {memory.title || (memory.description.length > 60 ? `${memory.description.slice(0, 60)}...` : memory.description)}
                </h2>

                {/* Excerpt */}
                {memory.title && memory.description && (
                  <p className="mt-3 line-clamp-2 text-sm sm:text-base text-white/80 font-normal leading-relaxed max-w-xl">
                    {memory.description}
                  </p>
                )}

                {/* Direct CTA to Story */}
                <div className="mt-5 sm:mt-6 flex items-center gap-4">
                  <Link
                    href={getMemoryUrl(memory)}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#121417] shadow-lg transition-all hover:bg-[#F6F3EC] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Baca Kisah Ini</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {memories.length > 1 && (
          <div className="hidden sm:flex items-center gap-2.5 absolute bottom-14 right-12 lg:right-16 z-20">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Slide sebelumnya"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white hover:text-[#121417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Slide berikutnya"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white hover:text-[#121417] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Mobile side arrows */}
        {memories.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Slide sebelumnya"
              className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Slide berikutnya"
              className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Progress Bar Indicators */}
        {memories.length > 1 && (
          <div className="absolute bottom-4 left-6 right-6 sm:left-12 sm:right-auto z-20 flex items-center gap-1.5">
            {memories.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === currentIndex ? "true" : undefined}
                onClick={() => setPage(([prev]) => [i, i > prev ? 1 : -1])}
                className="flex h-6 items-center py-2 focus-visible:outline-none"
              >
                <span
                  className={`block h-1 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-10 bg-white"
                      : "w-3 bg-white/35 hover:bg-white/70"
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
