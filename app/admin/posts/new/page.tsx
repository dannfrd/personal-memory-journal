import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { MemoryForm } from "@/src/components/admin/MemoryForm";

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-10">
        <PageContainer>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10">
            <div>
              <Link
                href="/admin/posts"
                className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Kembali ke Daftar Memori</span>
              </Link>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Archive Entry</span>
              </div>
              <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Rangkai Memori Baru
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-foreground/60 max-w-sm">
              Unggah foto terbaik, pilih gaya bingkai, dan tuliskan kisah di balik momen tersebut.
            </p>
          </div>
          <MemoryForm />
        </PageContainer>
      </main>
    </div>
  );
}
