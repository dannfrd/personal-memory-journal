"use client";

import { Memory } from "@/src/types";
import Image from "next/image";
import { useState } from "react";
import { MemoryIgModal } from "./MemoryIgModal";

interface MemoryIgGridProps {
  memories: Memory[];
}

export function MemoryIgGrid({ memories }: MemoryIgGridProps) {
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {memories.map((memory, index) => (
          <button
            key={memory.id}
            onClick={() => setSelectedMemoryIndex(index)}
            className="relative aspect-square overflow-hidden bg-[#D2CBC0] group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2B303A] focus:ring-offset-2"
          >
            {/* Main Image */}
            <Image
              src={memory.cover_image_url}
              alt={memory.title || memory.description}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 400px"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

            {/* Multiple images indicator */}
            {memory.post_images && memory.post_images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {memory.post_images.length + 1}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedMemoryIndex !== null && (
        <MemoryIgModal
          memory={memories[selectedMemoryIndex]}
          onClose={() => setSelectedMemoryIndex(null)}
          onPrevious={() => {
            if (selectedMemoryIndex > 0) {
              setSelectedMemoryIndex(selectedMemoryIndex - 1);
            }
          }}
          onNext={() => {
            if (selectedMemoryIndex < memories.length - 1) {
              setSelectedMemoryIndex(selectedMemoryIndex + 1);
            }
          }}
          hasPrevious={selectedMemoryIndex > 0}
          hasNext={selectedMemoryIndex < memories.length - 1}
          currentIndex={selectedMemoryIndex}
          totalMemories={memories.length}
        />
      )}
    </>
  );
}
