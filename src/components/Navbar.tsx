"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#EAE5DF]/90 backdrop-blur-md border-b border-black/5 transition-all">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-8 sm:py-4 lg:px-12">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/#home"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-70"
            aria-label="Memory Jurnal"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/logo-lovelog.png"
              alt="Logo Lovelog"
              width={210}
              height={100}
              priority
              className="h-8 w-auto sm:h-10 mix-blend-normal"
            />
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#2B303A] sm:text-xs">
              Memory Jurnal
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#2B303A] transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A] sm:hidden"
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>

          <nav aria-label="Primary Navigation" className="hidden items-center gap-1 rounded-full bg-white/75 p-1 text-xs font-bold tracking-[0.2em] uppercase text-[#2B303A] shadow-sm backdrop-blur-md sm:flex border border-black/5">
            <Link href="/#home" className="rounded-full px-5 py-2.5 transition-colors hover:bg-[#2B303A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A]">
              Home
            </Link>
            <Link href="/#journal" className="rounded-full px-5 py-2.5 transition-colors hover:bg-[#2B303A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A]">
              Journal
            </Link>
            <Link href="/#gallery" className="rounded-full px-5 py-2.5 transition-colors hover:bg-[#2B303A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A]">
              Gallery
            </Link>
          </nav>

          {isMenuOpen && (
            <nav
              id="mobile-nav"
              aria-label="Mobile Navigation"
              className="absolute left-4 right-4 top-full mt-2 flex flex-col gap-1 rounded-2xl bg-[#FAF8F5] p-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#2B303A] shadow-xl border border-black/10 sm:hidden"
            >
            <Link
              href="/#home"
              className="rounded-xl px-4 py-3.5 transition-colors hover:bg-black/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#journal"
              className="rounded-xl px-4 py-3.5 transition-colors hover:bg-black/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Journal
            </Link>
            <Link
              href="/#gallery"
              className="rounded-xl px-4 py-3.5 transition-colors hover:bg-black/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
          </nav>
        )}
        </div>
      </div>
    </header>
  );
}
