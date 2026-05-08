"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MemoryDetailGallery({ coverImage, images = [], memoryId, frameStyle = "minimal" }: { coverImage: string, images?: { image_url: string }[], memoryId?: string, frameStyle?: string | null }) {
  const allImages = [coverImage, ...images.map(img => img.image_url)];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideNext = () => {
    setDirection(1);
    setIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };

  const slidePrev = () => {
    setDirection(-1);
    setIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };

  const getFrameClasses = (style: string | null) => {
    switch (style) {
      case "polaroid":
        return "border-[12px] border-b-[48px] border-white shadow-xl bg-white";
      case "film":
        return "border-x-[20px] border-y-[8px] border-black shadow-lg bg-black";
      case "wavy":
        return "rounded-[2rem] border-8 border-white/80 shadow-lg";
      case "stamp":
        return "border-[16px] border-white outline-dashed outline-2 outline-gray-300 shadow-md bg-white p-1";
      case "minimal":
      default:
        return "drop-shadow-2xl";
    }
  };

  const frameClasses = getFrameClasses(frameStyle);

  if (allImages.length <= 1) {
    const content = (
      <>
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0 overflow-hidden hidden sm:block">
           <Image src={coverImage} alt="Memory Background" fill className="object-cover opacity-50 blur-2xl scale-125" unoptimized />
        </div>
        {/* Main Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-12 z-10 pointer-events-none">
          <div className={`relative h-full max-h-full w-full pointer-events-auto flex items-center justify-center`}>
            <Image src={coverImage} alt="Memory" fill className={`object-contain ${frameClasses}`} sizes="(max-width: 1024px) 100vw, 50vw" unoptimized priority />
          </div>
        </div>
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

      <AnimatePresence mode="wait" custom={direction}>
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-12 z-10 pointer-events-none overflow-hidden">
          <motion.div
            key={index}
            custom={direction}
            initial={(d: number) => ({ opacity: 0, x: d > 0 ? 100 : -100, scale: 0.95 })}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={(d: number) => ({ opacity: 0, x: d > 0 ? -100 : 100, scale: 0.95 })}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -50 || velocity.x < -500) {
                slideNext();
              } else if (swipe > 50 || velocity.x > 500) {
                slidePrev();
              }
            }}
            className={`relative h-full w-full pointer-events-auto flex items-center justify-center`}
          >
            <img
              src={allImages[index]}
              alt="Memory Gallery Image"
              className={`max-h-full max-w-full object-contain ${frameClasses} pointer-events-none select-none`}
            />
          </motion.div>
        </div>
      </AnimatePresence>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-30">
        {allImages.map((_, i) => (
          <button 
            key={i} 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              setDirection(i > index ? 1 : -1);
              setIndex(i); 
            }} 
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all ${i === index ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
      
      {/* Click zones for navigation */}
      <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer z-30" onClick={(e) => { e.preventDefault(); e.stopPropagation(); slidePrev(); }}></div>
      {memoryId && (
        <Link href={`/memories/${memoryId}`} className="absolute inset-y-0 left-1/4 right-1/4 cursor-pointer z-30 block" aria-label="View Memory" />
      )}
      <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer z-30" onClick={(e) => { e.preventDefault(); e.stopPropagation(); slideNext(); }}></div>
    </div>
  );
}
