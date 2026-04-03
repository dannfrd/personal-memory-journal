import Link from "next/link";
import { PageContainer } from "../PageContainer";
import { BookImage, MessageSquare } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/5">
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Link href="/admin/posts" className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80">
            Memory Journal <span className="text-foreground/40 font-normal ml-1">Admin</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin/posts" className="flex items-center gap-1.5 text-foreground/60 transition-colors hover:text-foreground">
              <BookImage className="h-4 w-4" />
              Memories
            </Link>
            <Link href="/admin/comments" className="flex items-center gap-1.5 text-foreground/60 transition-colors hover:text-foreground">
              <MessageSquare className="h-4 w-4" />
              Comments
            </Link>
            <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground">
              View Gallery
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
