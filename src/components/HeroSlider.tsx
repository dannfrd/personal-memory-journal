"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Memory } from "@/src/types";

export function HeroSlider({ memories }: { memories: Memory[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!memories || memories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [memories]);

  if (!memories || memories.length === 0) return null;

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-[#1C1E1F]">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={memories[currentIndex].cover_image_url}
            alt="Featured Memory"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
