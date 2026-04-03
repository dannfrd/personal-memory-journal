"use client";

import { Memory } from "@/src/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

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
    <section className="relative h-[62vh] min-h-[360px] w-full overflow-hidden bg-[#1C1E1F] sm:h-[85vh]">
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
            className="object-contain object-center sm:object-cover"
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
