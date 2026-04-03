import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { PageContainer } from "@/src/components/PageContainer";
import { DeleteCommentButton } from "@/src/components/admin/DeleteCommentButton";
import { formatDate } from "@/src/lib/utils";
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

  const totalReplies = comments.filter((c) => !!c.parent_id).length;
  const totalMain = comments.filter((c) => !c.parent_id).length;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 py-12">
        <PageContainer>
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Manage Comments
              </h1>
              <p className="mt-1 text-sm text-foreground/50">
                {comments.length} total &mdash; {totalMain} reflections, {totalReplies} replies
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
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white py-20 dark:border-white/5 dark:bg-zinc-900/50">
              <MessageCircle className="h-10 w-10 text-foreground/20" />
              <p className="text-sm text-foreground/40">Belum ada komentar.</p>
            </div>
          )}

          {/* Table */}
          {!error && comments.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/5 dark:bg-zinc-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/5 bg-black/[0.02] text-foreground/60 dark:border-white/5 dark:bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 font-medium w-[160px]">User</th>
                      <th className="px-6 py-4 font-medium">Comment</th>
                      <th className="px-6 py-4 font-medium w-[180px]">Memory</th>
                      <th className="px-6 py-4 font-medium w-[140px]">Date</th>
                      <th className="px-6 py-4 font-medium text-right w-[80px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {comments.map((comment) => (
                      <tr
                        key={comment.id}
                        className="group transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                      >
                        {/* Username */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {comment.parent_id && (
                              <CornerDownRight className="h-3 w-3 shrink-0 text-foreground/30" />
                            )}
                            <span className="font-semibold text-foreground/80 truncate">
                              {comment.username}
                            </span>
                          </div>
                          {comment.parent_id && (
                            <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-foreground/40 pl-5">
                              Reply
                            </span>
                          )}
                        </td>

                        {/* Content */}
                        <td className="px-6 py-4 max-w-xs">
                          <p className="line-clamp-2 text-foreground/70 leading-relaxed">
                            {comment.content}
                          </p>
                        </td>

                        {/* Memory Link */}
                        <td className="px-6 py-4">
                          {comment.memory ? (
                            <Link
                              href={`/memories/${comment.memory.id}`}
                              target="_blank"
                              className="text-xs text-foreground/60 hover:text-foreground transition-colors line-clamp-2"
                            >
                              {comment.memory.title || comment.memory.description.slice(0, 40) + "…"}
                            </Link>
                          ) : (
                            <span className="text-xs text-foreground/30">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-foreground/50 whitespace-nowrap">
                          {formatDate(comment.created_at)}
                        </td>

                        {/* Action */}
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
