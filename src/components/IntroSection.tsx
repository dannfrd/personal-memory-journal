"use client";

import type { Memory } from "@/src/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { memo, useMemo } from "react";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export const IntroSection = memo(function IntroSection({ memories = [] }: { memories?: Memory[] }) {
  const collageItems = useMemo(() => {
    const allImages = memories
      .flatMap((m) => [
        m.cover_image_url,
        ...(m.post_images?.map((img) => img.image_url) || []),
      ])
      .filter(Boolean);

    return allImages.slice(0, 12).map((src, idx) => {
      const h = hashString(`${src}-${idx}`);
      return {
        src,
        offset: (h % 21) - 10,
        rotate: ((h >> 4) % 11) - 5,
        scale: 0.98 + ((h % 10) / 100),
      };
    });
  }, [memories]);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#EAE5DF] px-8 py-32 text-center text-[#2B303A] sm:px-16 lg:py-48">
      {/* --- Background Collage --- */}
      {collageItems.length > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-[0.28]">
          <div className="grid h-full w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 p-4 transform scale-110 rotate-[-1.5deg]">
            {collageItems.map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-lg
                  ${i % 3 === 0 ? "hidden md:block" : ""}
                `}
                style={{
                  transform: `translateY(${item.offset}px) rotate(${item.rotate}deg) scale(${item.scale})`,
                }}
              >
                <Image
                  src={item.src}
                  alt="Collage Background"
                  fill
                  sizes="(max-width: 768px) 45vw, 20vw"
                  quality={60}
                  loading="lazy"
                  className="object-cover saturate-110"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#EAE5DF] via-[#EAE5DF]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#EAE5DF]/70 via-transparent to-[#EAE5DF]" />
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
});
