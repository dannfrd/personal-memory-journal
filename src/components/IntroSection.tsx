"use client";

import { motion } from "framer-motion";

export function IntroSection() {
  return (
    <section className="flex flex-col items-center justify-center bg-[#EAE5DF] px-8 py-32 text-center text-[#2B303A] sm:px-16 lg:py-48">
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
        className="max-w-2xl text-lg font-medium opacity-70 sm:text-xl"
      >
        Setiap momen diabadikan dengan sepenuh hati. Selamat datang di galeri kenangan ini.
      </motion.p>
    </section>
  );
}
