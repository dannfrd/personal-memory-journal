import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { MemoryForm } from "@/src/components/admin/MemoryForm";

export default function NewPostPage() {
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
              Tambah Memori Baru
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#1F242D]/60">
              Unggah foto sampul, tambahkan album galeri, dan tuliskan cerita di balik momen ini.
            </p>
          </div>
          <MemoryForm />
        </PageContainer>
      </main>
    </div>
  );
}
