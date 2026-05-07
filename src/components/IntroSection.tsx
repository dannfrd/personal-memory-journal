"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Memory } from "@/src/types";

export function IntroSection({ memories = [] }: { memories?: Memory[] }) {
  // Extract all images (covers + gallery images)
  const allImages = memories.flatMap((m) => [
    m.cover_image_url,
    ...(m.post_images?.map((img) => img.image_url) || []),
  ]).filter(Boolean);

  // Take up to 15 images for the background collage
  const collageImages = allImages.slice(0, 15);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#EAE5DF] px-8 py-32 text-center text-[#2B303A] sm:px-16 lg:py-48">
      {/* --- Background Collage --- */}
      {collageImages.length > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-[0.15]">
          <div className="grid h-full w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 p-4 transform scale-110 rotate-[-2deg]">
            {collageImages.map((src, i) => (
              <div 
                key={i} 
                className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-lg
                  ${i % 2 === 0 ? "mt-8" : "-mt-8"} 
                  ${i % 3 === 0 ? "hidden md:block" : ""}
                `}
              >
                <Image
                  src={src}
                  alt="Collage Background"
                  fill
                  className="object-cover grayscale"
                  unoptimized
                />
              </div>
            ))}
          </div>
          {/* Heavy gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#EAE5DF] via-[#EAE5DF]/50 to-[#EAE5DF]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#EAE5DF] via-transparent to-[#EAE5DF]" />
        </div>
      )}

      {/* --- Main Content --- */}
      <div className="relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl lg:text-7xl"
        >
          Ruang hening untuk merangkai dan menghidupkan kembali kepingan memori terindah kita.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-lg font-medium opacity-70 sm:text-xl"
        >
          Setiap momen diabadikan dengan sepenuh hati. Selamat datang di galeri kenangan ini.
        </motion.p>
      </div>
    </section>
  );
}
