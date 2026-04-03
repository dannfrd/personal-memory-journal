"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full pointer-events-none p-4 sm:p-8 lg:p-12">
      <div className="relative flex items-center justify-between gap-3">
        <Link
          href="/#home"
          className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-90"
          aria-label="Memory Jurnal"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/logo-lovelog.png"
            alt="Logo Lovelog"
            width={210}
            height={100}
            priority
            className="h-10 w-auto sm:h-12 mix-blend-normal"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2B303A] sm:text-xs">
            Memory Jurnal
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white/85 p-3 text-[#2B303A] shadow-sm backdrop-blur-sm transition-opacity hover:opacity-90 sm:hidden"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <nav className="pointer-events-auto hidden items-center gap-8 rounded-full bg-white/85 px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase text-[#2B303A] shadow-sm backdrop-blur-sm sm:flex">
          <Link href="/#home" className="transition-opacity hover:opacity-70">
            Home
          </Link>
          <Link href="/#gallery" className="transition-opacity hover:opacity-70">
            Gallery
          </Link>
          <Link href="/#journal" className="transition-opacity hover:opacity-70">
            Journal
          </Link>
        </nav>

        {isMenuOpen && (
          <nav
            id="mobile-nav"
            className="pointer-events-auto absolute right-0 top-full mt-3 flex w-48 flex-col rounded-2xl bg-white/95 p-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2B303A] shadow-md backdrop-blur-sm sm:hidden"
          >
            <Link
              href="/#home"
              className="rounded-xl px-4 py-3 transition-colors hover:bg-black/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#gallery"
              className="rounded-xl px-4 py-3 transition-colors hover:bg-black/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/#journal"
              className="rounded-xl px-4 py-3 transition-colors hover:bg-black/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Journal
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
