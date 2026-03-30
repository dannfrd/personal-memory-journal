"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MemoryDetailGallery({ coverImage, images = [], memoryId }: { coverImage: string, images?: { image_url: string }[], memoryId?: string }) {
  const allImages = [coverImage, ...images.map(img => img.image_url)];
  const [index, setIndex] = useState(0);

  if (allImages.length <= 1) {
    const content = (
      <>
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0 overflow-hidden hidden sm:block">
           <Image src={coverImage} alt="Memory Background" fill className="object-cover opacity-50 blur-2xl scale-125" unoptimized />
        </div>
        {/* Main Image */}
        <Image src={coverImage} alt="Memory" fill className="object-contain z-10 drop-shadow-2xl" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized priority />
      </>
    );

    return (
      <div className="group relative w-full h-full bg-[#1C1E1F] overflow-hidden">
        {memoryId ? (
          <Link href={`/memories/${memoryId}`} className="absolute inset-0 z-20 block" aria-label="View Memory" />
        ) : null}
        {content}
      </div>
    );
  }

  return (
    <div className="group relative w-full h-full bg-[#1C1E1F] overflow-hidden">
      {/* Blurred background matching current slide */}
      <AnimatePresence mode="wait">
         <motion.div
           key={`bg-${index}`}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.6 }}
           className="absolute inset-0 z-0 hidden sm:block overflow-hidden"
         >
           <Image src={allImages[index]} alt="Blur" fill className="object-cover opacity-50 blur-2xl scale-125" unoptimized />
         </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={allImages[index]}
          alt="Memory Gallery Image"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 h-full w-full object-contain z-10 drop-shadow-2xl"
        />
      </AnimatePresence>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-30">
        {allImages.map((_, i) => (
          <button 
            key={i} 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }} 
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all ${i === index ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
      
      {/* Click zones for navigation */}
      <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-30" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1); }}></div>
      {memoryId && (
        <Link href={`/memories/${memoryId}`} className="absolute inset-y-0 left-1/3 right-1/3 cursor-pointer z-30 block" aria-label="View Memory" />
      )}
      <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-30" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1); }}></div>
    </div>
  );
}
