"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { MemoryDetailGallery } from "./MemoryDetailGallery";
import { LikeButton } from "./social/LikeButton";
import { Comments } from "./social/Comments";
import { MessageCircle } from "lucide-react";
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
  const [showComments, setShowComments] = useState(false);
  
  const isEven = index % 2 === 0;
  const palette = PALETTES[index % PALETTES.length];

  return (
    <section 
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
          </Link>
            
          <div className="flex flex-col items-start gap-8 mb-12">
            <div className="flex items-center gap-4">
              <LikeButton postId={memory.id} initialCount={memory.likes?.[0]?.count || 0} />
              <button 
                onClick={() => setShowComments(!showComments)}
                className="group flex items-center gap-3 rounded-full border border-current opacity-60 px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>{memory.comments?.[0]?.count || 0} Reflections</span>
              </button>
            </div>
            
            {showComments && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setShowComments(false)}>
                <div 
                  className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 sm:p-12 shadow-2xl ${palette.bg} ${palette.text}`}
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowComments(false)}
                    className="absolute right-6 top-6 p-2 rounded-full hover:bg-current hover:bg-opacity-10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 hover:opacity-100 transition-opacity"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <Comments postId={memory.id} />
                </div>
              </div>
            )}
          </div>
          
          <Link href={`/memories/${memory.id}`} className="inline-flex items-center gap-4 border border-current rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all hover:bg-current hover:text-white hover:bg-opacity-10 dark:hover:text-black dark:hover:bg-opacity-100">
            View Collection
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
        <div className="relative w-full aspect-[4/5] max-h-[85vh] shadow-2xl overflow-hidden rounded-sm">
          <MemoryDetailGallery coverImage={memory.cover_image_url} images={memory.post_images} memoryId={memory.id} />
        </div>
      </div>
    </section>
  );
}
