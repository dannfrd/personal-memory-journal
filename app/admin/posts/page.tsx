import Link from "next/link";
import Image from "next/image";
import { Plus, Edit3, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { DeleteMemoryButton } from "@/src/components/admin/DeleteMemoryButton";
import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { fetchMemories } from "@/src/lib/vpsMemoryApi";
import type { Memory } from "@/src/types";

export const revalidate = 0;

export default async function AdminPostsPage() {
  let posts: Memory[] = [];
  let error: Error | null = null;

  try {
    posts = await fetchMemories();
  } catch (err: unknown) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F242D] flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-10">
        <PageContainer>
          {/* Clean Header + Primary CTA */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1F242D]">
                Koleksi Memori
              </h1>
              <p className="text-xs text-[#1F242D]/55 mt-0.5">
                {posts.length} memori terpublikasi
              </p>
            </div>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#1F242D] px-5 py-2.5 text-xs font-semibold text-[#F6F3EC] shadow-xs transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Memori Baru</span>
            </Link>
          </div>

          {/* Clean Memories Table */}
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs">
            {error ? (
              <div className="p-6 text-red-600 text-sm">Error: {error.message}</div>
            ) : posts?.length === 0 ? (
              <div className="p-14 text-center text-[#1F242D]/55 text-sm">
                Belum ada memori yang tersimpan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/10 bg-[#F6F3EC]/60 text-[11px] font-semibold uppercase tracking-wider text-[#1F242D]/55">
                    <tr>
                      <th className="px-6 py-3.5">Memori</th>
                      <th className="px-6 py-3.5">Tanggal</th>
                      <th className="px-6 py-3.5 text-center">Interaksi</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {posts?.map((post) => {
                      const likeCount = post.likes?.[0]?.count || 0;
                      const commentCount = post.comments?.[0]?.count || 0;

                      return (
                        <tr
                          key={post.id}
                          className="transition-colors hover:bg-[#F6F3EC]/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5">
                                <Image
                                  src={post.cover_image_url}
                                  alt={post.title || "Memory"}
                                  fill
                                  sizes="56px"
                                  quality={60}
                                  className="object-cover"
                                />
                              </div>
                              <div className="max-w-md min-w-0">
                                <div className="font-serif text-base font-semibold text-[#1F242D] truncate">
                                  {post.title || "Tanpa Judul"}
                                </div>
                                <div className="truncate text-xs text-[#1F242D]/60">
                                  {post.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-[#1F242D]/65 whitespace-nowrap">
                            {formatDate(post.memory_date)}
                          </td>

                          <td className="px-6 py-4 text-center whitespace-nowrap text-xs text-[#1F242D]/65">
                            {likeCount} Suka &bull; {commentCount} Refleksi
                          </td>

                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={getMemoryUrl(post)}
                                target="_blank"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1F242D]/50 transition-colors hover:bg-black/5 hover:text-[#1F242D]"
                                title="Lihat"
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </Link>
                              <Link
                                href={`/admin/posts/${post.id}/edit`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1F242D]/50 transition-colors hover:bg-black/5 hover:text-[#1F242D]"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" aria-hidden="true" />
                              </Link>
                              <DeleteMemoryButton id={post.id} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
