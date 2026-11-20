"use client";

import { Lock, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#F6F3EC]/92 backdrop-blur-xl border-b border-black/10 shadow-sm py-2.5"
          : "bg-[#F6F3EC]/80 backdrop-blur-md border-b border-black/5 py-3.5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/#home"
            className="inline-flex items-center gap-3.5 transition-opacity hover:opacity-80"
            aria-label="Lovelog Memory Journal"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/logo-lovelog.png"
              alt="Logo Lovelog"
              width={210}
              height={100}
              priority
              className="h-8 w-auto sm:h-9 mix-blend-normal"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1F242D] leading-none">
                Lovelog
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#1F242D]/55 mt-0.5">
                Memory Archive
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pill */}
          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-1 rounded-full bg-white/80 p-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1F242D] shadow-sm backdrop-blur-md sm:flex border border-black/10"
          >
            <Link
              href="/#home"
              className="rounded-full px-5 py-2 transition-all hover:bg-[#1F242D] hover:text-[#F6F3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D]"
            >
              Featured
            </Link>
            <Link
              href="/#journal"
              className="rounded-full px-5 py-2 transition-all hover:bg-[#1F242D] hover:text-[#F6F3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D]"
            >
              Manifesto
            </Link>
            <Link
              href="/#gallery"
              className="rounded-full px-5 py-2 transition-all hover:bg-[#1F242D] hover:text-[#F6F3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D]"
            >
              Gallery
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F242D]/80 transition-all hover:bg-[#1F242D] hover:text-[#F6F3EC] hover:border-[#1F242D]"
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              <span>Curator</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#1F242D] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D] sm:hidden"
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {isMenuOpen && (
            <nav
              id="mobile-nav"
              aria-label="Mobile Navigation"
              className="absolute left-4 right-4 top-full mt-2 flex flex-col gap-1 rounded-2xl bg-[#FAF8F5] p-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1F242D] shadow-2xl border border-black/10 sm:hidden"
            >
              <Link
                href="/#home"
                className="rounded-xl px-4 py-3.5 transition-colors hover:bg-black/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Featured
              </Link>
              <Link
                href="/#journal"
                className="rounded-xl px-4 py-3.5 transition-colors hover:bg-black/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Manifesto
              </Link>
              <Link
                href="/#gallery"
                className="rounded-xl px-4 py-3.5 transition-colors hover:bg-black/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <div className="my-1 h-px bg-black/10" />
              <Link
                href="/admin/posts"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-[#1F242D]/70 transition-colors hover:bg-black/5 hover:text-[#1F242D]"
                onClick={() => setIsMenuOpen(false)}
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Curator Studio</span>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
