"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Memory } from "@/src/types";
import { formatDate } from "@/src/lib/utils";

const PALETTES = [
  { bg: "bg-[#EAE5DF]", text: "text-[#2B303A]", imgBg: "bg-[#D2CBC0]" }, // Sand
  { bg: "bg-[#3D5257]", text: "text-[#F2F0EB]", imgBg: "bg-[#2A393C]" }, // Slate 
  { bg: "bg-[#6A412F]", text: "text-[#F2F0EB]", imgBg: "bg-[#4F3022]" }, // Chocolate 
  { bg: "bg-[#C4B7AB]", text: "text-[#3D3B3A]", imgBg: "bg-[#A6998D]" }, // Rose Beige
  { bg: "bg-[#1C1E1F]", text: "text-[#EAE5DF]", imgBg: "bg-[#0E0F10]" }, // Deep Charcoal
];

export function MemoryCard({ memory, index = 0 }: { memory: Memory; index?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yImage = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const isEven = index % 2 === 0;
  const palette = PALETTES[index % PALETTES.length];

  return (
    <section 
      ref={containerRef}
      className={`relative flex min-h-screen w-full flex-col lg:flex-row overflow-hidden ${palette.bg} ${palette.text}`}
    >
      {/* Content Side */}
      <div className={`flex w-full flex-1 flex-col justify-center px-8 py-24 sm:px-16 lg:w-1/2 lg:px-24 xl:px-32 ${!isEven ? 'lg:order-2' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-8 flex items-center gap-4 text-sm font-bold tracking-[0.2em] uppercase opacity-70">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div className="h-px w-12 bg-current opacity-50"></div>
            <span>{formatDate(memory.memory_date)}</span>
          </div>

          <Link href={`/memories/${memory.id}`} className="group block focus:outline-none">
            {memory.title && (
              <h3 className="mb-4 font-serif text-3xl tracking-tight opacity-80 transition-opacity group-hover:opacity-100">
                {memory.title}
              </h3>
            )}
            <h2 className="mb-10 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl transition-opacity group-hover:opacity-80">
              {memory.description?.length > 80 ? memory.description.substring(0, 80) + "..." : memory.description}
            </h2>
            
            <div className="flex items-center gap-8 mb-12 opacity-60">
               <div className="text-xs font-bold tracking-[0.2em] uppercase">
                 {memory.likes?.[0]?.count || 0} Likes
               </div>
               <div className="text-xs font-bold tracking-[0.2em] uppercase">
                 {memory.comments?.[0]?.count || 0} Reflections
               </div>
            </div>
            
            <div className="inline-flex items-center gap-4 border border-current rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all hover:bg-current hover:text-white hover:bg-opacity-10 dark:hover:text-black dark:hover:bg-opacity-100">
              View Collection
            </div>
          </Link>
          
          {memory.location && (
             <div className="mt-16 text-sm font-bold uppercase tracking-[0.2em] opacity-50 flex items-center gap-3">
               <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
               {memory.location}
             </div>
          )}
        </motion.div>
      </div>

      {/* Image Side */}
      <div className={`relative flex w-full min-h-[60vh] lg:h-auto lg:w-1/2 items-center justify-center p-8 sm:p-16 lg:p-24 ${palette.imgBg}`}>
        <Link href={`/memories/${memory.id}`} className="block relative w-full aspect-[4/5] max-h-[85vh] cursor-pointer group shadow-2xl overflow-hidden rounded-sm">
          <motion.div 
            style={{ y: yImage }}
            className="absolute -top-[15%] -bottom-[15%] left-0 right-0 w-full"
          >
            <Image
              src={memory.cover_image_url}
              alt={memory.title || "Memory"}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-[0.22,1,0.36,1] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
