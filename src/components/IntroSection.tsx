"use client";

import type { Memory } from "@/src/types";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { memo, useMemo } from "react";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export const IntroSection = memo(function IntroSection({
  memories = [],
}: {
  memories?: Memory[];
}) {
  const collageItems = useMemo(() => {
    const allImages = memories
      .flatMap((m) => [
        m.cover_image_url,
        ...(m.post_images?.map((img) => img.image_url) || []),
      ])
      .filter(Boolean);

    return allImages.slice(0, 10).map((src, idx) => {
      const h = hashString(`${src}-${idx}`);
      return {
        src,
        offset: (h % 21) - 10,
        rotate: ((h >> 4) % 9) - 4,
        scale: 0.98 + (h % 8) / 100,
      };
    });
  }, [memories]);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#F6F3EC] px-6 py-24 text-center text-[#1F242D] sm:px-16 lg:py-36 border-b border-black/10">
      {/* Subtle Background Collage */}
      {collageItems.length > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-[0.18]">
          <div className="grid h-full w-full grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 p-6 transform scale-105">
            {collageItems.map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-md border-4 border-white ${
                  i % 3 === 0 ? "hidden md:block" : ""
                }`}
                style={{
                  transform: `translateY(${item.offset}px) rotate(${item.rotate}deg) scale(${item.scale})`,
                }}
              >
                <Image
                  src={item.src}
                  alt="Collage Background"
                  fill
                  sizes="(max-width: 768px) 45vw, 20vw"
                  quality={55}
                  loading="lazy"
                  className="object-cover saturate-110"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F6F3EC] via-[#F6F3EC]/60 to-[#F6F3EC]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6F3EC] via-transparent to-[#F6F3EC]" />
        </div>
      )}

      {/* Editorial Manifesto Card */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-[#1F242D]/15 bg-white/80 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#1F242D]/75 shadow-sm mb-8"
        >
          <Sparkles className="h-3 w-3 text-amber-700" aria-hidden="true" />
          <span>The Editorial Manifesto</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mb-6 font-serif text-4xl font-medium leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl text-[#1F242D]"
        >
          Ruang hening untuk merangkai dan menghidupkan kembali{" "}
          <span className="italic font-normal text-amber-900">
            kepingan memori terindah kita.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-[#1F242D]/75"
        >
          Setiap momen diabadikan dengan sepenuh hati dalam lembaran waktu.
          Jelajahi kembali jejak perjalanan, tempat, dan cerita yang pernah kita lalui bersama.
        </motion.p>
      </div>
    </section>
  );
});
