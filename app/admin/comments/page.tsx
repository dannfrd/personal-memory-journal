import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { DeleteCommentButton } from "@/src/components/admin/DeleteCommentButton";
import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import { CornerDownRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { fetchAdminComments, type AdminComment } from "@/src/lib/vpsMemoryApi";

export const revalidate = 0;

export default async function AdminCommentsPage() {
  let comments: AdminComment[] = [];
  let error: Error | null = null;

  try {
    comments = await fetchAdminComments();
  } catch (err: unknown) {
    error = err instanceof Error ? err : new Error(String(err));
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F242D] flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-10">
        <PageContainer>
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1F242D]">
              Refleksi &amp; Komentar
            </h1>
            <p className="mt-0.5 text-xs text-[#1F242D]/55">
              {comments.length} komentar masuk
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Error: {error.message}
            </div>
          )}

          {!error && comments.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-16">
              <MessageCircle className="h-8 w-8 text-[#1F242D]/20" aria-hidden="true" />
              <p className="text-sm text-[#1F242D]/50">Belum ada komentar.</p>
            </div>
          )}

          {!error && comments.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/10 bg-[#F6F3EC]/60 text-[11px] font-semibold uppercase tracking-wider text-[#1F242D]/55">
                    <tr>
                      <th className="px-6 py-3.5 w-[180px]">Pengirim</th>
                      <th className="px-6 py-3.5">Komentar</th>
                      <th className="px-6 py-3.5 w-[200px]">Memori</th>
                      <th className="px-6 py-3.5 w-[140px]">Tanggal</th>
                      <th className="px-6 py-3.5 text-right w-[70px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {comments.map((comment) => (
                      <tr
                        key={comment.id}
                        className="transition-colors hover:bg-[#F6F3EC]/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {comment.parent_id && (
                              <CornerDownRight
                                className="h-3.5 w-3.5 shrink-0 text-[#1F242D]/35"
                                aria-hidden="true"
                              />
                            )}
                            <span className="font-semibold text-[#1F242D] truncate">
                              {comment.username}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 max-w-md">
                          <p className="line-clamp-2 text-[#1F242D]/80 leading-relaxed">
                            {comment.content}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {comment.memory ? (
                            <Link
                              href={getMemoryUrl(comment.memory)}
                              target="_blank"
                              className="text-xs text-[#1F242D]/65 hover:text-[#1F242D] hover:underline line-clamp-1"
                            >
                              {comment.memory.title ||
                                comment.memory.description.slice(0, 40) + "…"}
                            </Link>
                          ) : (
                            <span className="text-xs text-[#1F242D]/30">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-[#1F242D]/55 whitespace-nowrap">
                          {formatDate(comment.created_at)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <DeleteCommentButton commentId={comment.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </PageContainer>
      </main>
    </div>
  );
}
