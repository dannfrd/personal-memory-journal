"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PageContainer } from "../PageContainer";
import { BookImage, ExternalLink, MessageSquare, Plus } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export function AdminHeader() {
  const pathname = usePathname();
  const isPostsActive = pathname?.startsWith("/admin/posts");
  const isCommentsActive = pathname?.startsWith("/admin/comments");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#FAF8F5]/90 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo + Studio Badge */}
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo-lovelog.png"
              alt="Lovelog"
              width={140}
              height={64}
              className="h-7 w-auto"
            />
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                Lovelog
              </span>
              <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">
                Curator Studio
              </span>
            </div>
          </Link>

          {/* Navigation Tabs & Quick Actions */}
          <nav className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            <div className="flex items-center rounded-full border border-black/10 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-white/[0.04]">
              <Link
                href="/admin/posts"
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
                  isPostsActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-foreground/65 hover:text-foreground"
                }`}
              >
                <BookImage className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Memories</span>
              </Link>
              <Link
                href="/admin/comments"
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
                  isCommentsActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-foreground/65 hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reflections</span>
              </Link>
            </div>

            <Link
              href="/admin/posts/new"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-800"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tulis Memori</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground dark:border-white/10 dark:hover:bg-white/5"
            >
              <span>Lihat Website</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />
            <SignOutButton />
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
