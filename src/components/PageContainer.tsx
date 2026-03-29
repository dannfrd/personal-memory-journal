"use client";

import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </motion.div>
  );
}
