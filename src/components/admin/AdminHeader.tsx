import Link from "next/link";
import { PageContainer } from "../PageContainer";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/5">
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Link href="/admin/posts" className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80">
            Memory Journal <span className="text-foreground/40 font-normal ml-1">Admin</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground">
              View Gallery
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
