import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full pointer-events-none p-6 sm:p-12">
      <div className="flex items-center justify-between">
        <Link
          href="/#home"
          className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-90"
          aria-label="Memory Jurnal"
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
      </div>
    </header>
  );
}
