"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PageContainer } from "../PageContainer";
import { SignOutButton } from "./SignOutButton";

export function AdminHeader() {
  const pathname = usePathname();
  const isPostsActive = pathname?.startsWith("/admin/posts");
  const isCommentsActive = pathname?.startsWith("/admin/comments");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#FAF8F5]/90 backdrop-blur-md">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo-lovelog.png"
              alt="Lovelog"
              width={120}
              height={54}
              className="h-7 w-auto"
            />
            <span className="font-serif text-lg font-bold tracking-tight text-[#1F242D]">
              Lovelog <span className="font-sans text-xs font-normal text-[#1F242D]/50 ml-1">Studio</span>
            </span>
          </Link>

          <nav className="flex items-center gap-5 text-xs font-semibold text-[#1F242D]">
            <Link
              href="/admin/posts"
              className={`transition-colors ${
                isPostsActive ? "text-[#1F242D] underline underline-offset-8 decoration-2" : "text-[#1F242D]/55 hover:text-[#1F242D]"
              }`}
            >
              Memori
            </Link>
            <Link
              href="/admin/comments"
              className={`transition-colors ${
                isCommentsActive ? "text-[#1F242D] underline underline-offset-8 decoration-2" : "text-[#1F242D]/55 hover:text-[#1F242D]"
              }`}
            >
              Komentar
            </Link>
            <Link
              href="/"
              className="text-[#1F242D]/55 transition-colors hover:text-[#1F242D]"
            >
              Lihat Galeri
            </Link>
            <div className="h-3.5 w-px bg-black/15" />
            <SignOutButton />
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
