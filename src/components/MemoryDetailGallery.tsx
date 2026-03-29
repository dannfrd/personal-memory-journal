"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MemoryDetailGallery({ coverImage, images = [] }: { coverImage: string, images?: { image_url: string }[] }) {
  const allImages = [coverImage, ...images.map(img => img.image_url)];
  const [index, setIndex] = useState(0);

  if (allImages.length <= 1) {
    return (
      <Image src={coverImage} alt="Memory" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized priority />
    );
  }

  return (
    <div className="group relative w-full h-full bg-[#1C1E1F]">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={allImages[index]}
          alt="Memory Gallery Image"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
        {allImages.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)} 
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all ${i === index ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
      
      {/* Click zones for navigation */}
      <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={() => setIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}></div>
      <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={() => setIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}></div>
    </div>
  );
}
