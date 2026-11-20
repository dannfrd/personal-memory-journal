import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { MemoryForm } from "@/src/components/admin/MemoryForm";
import type { Memory } from "@/src/types";
import { fetchMemoryById } from "@/src/lib/vpsMemoryApi";

export const revalidate = 0;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let memory: Memory | null = null;
  let error: Error | null = null;
  try {
    memory = await fetchMemoryById(id);
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  if (error || !memory) {
    notFound();
  }

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
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Curator Revision</span>
              </div>
              <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Sunting Memori: {memory.title || "Tanpa Judul"}
              </h1>
            </div>
          </div>
          <MemoryForm initialData={memory} />
        </PageContainer>
      </main>
    </div>
  );
}
