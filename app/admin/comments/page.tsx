import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { DeleteCommentButton } from "@/src/components/admin/DeleteCommentButton";
import { formatDate, getMemoryUrl } from "@/src/lib/utils";
import {
  Calendar,
  CornerDownRight,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Reply,
  Users,
} from "lucide-react";
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

  const totalReplies = comments.filter((c) => !!c.parent_id).length;
  const totalMain = comments.filter((c) => !c.parent_id).length;
  const uniqueAuthors = new Set(
    comments.map((c) => c.username.trim().toLowerCase())
  ).size;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-10">
        <PageContainer>
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400">
                Community &amp; Feedback
              </span>
              <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Moderasi Refleksi &amp; Komentar
              </h1>
            </div>
          </div>

          {/* KPI Metric Cards */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between text-foreground/60 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Refleksi Utama
                </span>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {totalMain}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Komentar langsung pada memori
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Balasan (Replies)
                </span>
                <Reply className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {totalReplies}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Percakapan berantai
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between text-foreground/60 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Kontributor Unik
                </span>
                <Users className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-bold text-foreground">
                {uniqueAuthors}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                Pengunjung yang meninggalkan jejak
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              Error: {error.message}
            </div>
          )}

          {/* Empty */}
          {!error && comments.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white py-20 dark:border-white/10 dark:bg-zinc-900/60">
              <MessageCircle className="h-10 w-10 text-foreground/20" aria-hidden="true" />
              <p className="font-serif text-xl text-foreground/60">
                Belum ada refleksi atau komentar yang masuk.
              </p>
            </div>
          )}

          {/* Table */}
          {!error && comments.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/10 bg-black/[0.02] text-[11px] font-bold uppercase tracking-wider text-foreground/60 dark:border-white/10 dark:bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 w-[200px]">Pengirim</th>
                      <th className="px-6 py-4">Isi Refleksi</th>
                      <th className="px-6 py-4 w-[220px]">Pada Memori</th>
                      <th className="px-6 py-4 w-[150px]">Tanggal</th>
                      <th className="px-6 py-4 text-right w-[90px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {comments.map((comment) => {
                      const initial =
                        comment.username?.trim().charAt(0).toUpperCase() || "?";

                      return (
                        <tr
                          key={comment.id}
                          className="group transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
                        >
                          {/* Username with Avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-serif text-sm font-bold text-foreground">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground truncate">
                                    {comment.username}
                                  </span>
                                </div>
                                {comment.parent_id ? (
                                  <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                                    <CornerDownRight className="h-3 w-3" aria-hidden="true" />
                                    Reply
                                  </span>
                                ) : (
                                  <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-foreground/45">
                                    Refleksi
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Content */}
                          <td className="px-6 py-4 max-w-md">
                            <p className="font-serif text-base text-foreground/85 leading-relaxed line-clamp-3">
                              &ldquo;{comment.content}&rdquo;
                            </p>
                          </td>

                          {/* Memory Link */}
                          <td className="px-6 py-4">
                            {comment.memory ? (
                              <Link
                                href={getMemoryUrl(comment.memory)}
                                target="_blank"
                                className="group/link inline-flex items-start gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
                              >
                                <span className="line-clamp-2">
                                  {comment.memory.title ||
                                    comment.memory.description.slice(0, 45) + "…"}
                                </span>
                                <ExternalLink
                                  className="h-3 w-3 shrink-0 opacity-50 group-hover/link:opacity-100 mt-0.5"
                                  aria-hidden="true"
                                />
                              </Link>
                            ) : (
                              <span className="text-xs text-foreground/30">—</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-xs text-foreground/60 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                              {formatDate(comment.created_at)}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-right">
                            <DeleteCommentButton commentId={comment.id} />
                          </td>
                        </tr>
                      );
                    })}
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
