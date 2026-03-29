import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full mix-blend-difference text-white pointer-events-none p-6 sm:p-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="pointer-events-auto text-xl font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-70">
          Memory Journal
        </Link>
        <nav className="pointer-events-auto flex items-center gap-8 text-xs font-bold tracking-[0.2em] uppercase hidden sm:flex">
          <Link href="/" className="transition-opacity hover:opacity-70">
            Home
          </Link>
          <Link href="/" className="transition-opacity hover:opacity-70">
            Gallery
          </Link>
          <Link href="/" className="transition-opacity hover:opacity-70">
            Journal
          </Link>
        </nav>
      </div>
    </header>
  );
}
