import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F242D] flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-10">
        <PageContainer className="max-w-3xl">
          <div className="mb-8">
            <Link
              href="/admin/posts"
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[#1F242D]/60 hover:text-[#1F242D] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Kembali ke Daftar Memori</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F242D]">
              Sunting Memori
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#1F242D]/60">
              Perbarui foto, bingkai, atau cerita untuk memori ini.
            </p>
          </div>
          <MemoryForm initialData={memory} />
        </PageContainer>
      </main>
    </div>
  );
}
