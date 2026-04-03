"use client";

import { useState, useEffect } from "react";
import { getComments, addComment } from "@/app/actions/memories";
import { Comment } from "@/src/types";
import { formatDate } from "@/src/lib/utils";
import { Loader2, CornerDownRight } from "lucide-react";

// Shared button style: solid fill on hover, always readable
const btnClass =
  "self-start rounded-full border border-current px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all " +
  "hover:bg-foreground hover:text-background hover:border-foreground " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

const btnLargeClass =
  "mt-4 self-start rounded-full border border-current px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all " +
  "hover:bg-foreground hover:text-background hover:border-foreground " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyUsername, setReplyUsername] = useState("");
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const res = await getComments(postId);
      if (res.success && res.comments) {
        setComments(res.comments as unknown as Comment[]);
      }
      setLoading(false);
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !content.trim()) return;
    setError(null);
    setSubmitting(true);

    const res = await addComment(postId, username, content);

    if (res.success) {
      const optimisticComment = {
        id: crypto.randomUUID(),
        post_id: postId,
        username,
        content,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, optimisticComment as unknown as Comment]);
      setContent("");
    } else {
      setError(res.error ?? "Gagal mengirim komentar.");
    }
    setSubmitting(false);
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyUsername.trim() || !replyContent.trim()) return;
    setReplyError(null);
    setSubmitting(true);

    const res = await addComment(postId, replyUsername, replyContent, parentId);

    if (res.success) {
      const optimisticComment = {
        id: crypto.randomUUID(),
        post_id: postId,
        parent_id: parentId,
        username: replyUsername,
        content: replyContent,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, optimisticComment as unknown as Comment]);
      setReplyContent("");
      setReplyUsername("");
      setReplyToId(null);
    } else {
      setReplyError(res.error ?? "Gagal mengirim reply.");
    }
    setSubmitting(false);
  };

  const mainComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="w-full max-w-2xl">
      <h3 className="mb-8 font-serif text-3xl tracking-tight opacity-90">
        Reflections ({comments.length})
      </h3>

      {loading ? (
        <div className="py-8 text-center opacity-50">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="space-y-10 mb-16">
          {mainComments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold tracking-[0.2em] uppercase text-xs opacity-80">
                    {comment.username}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-current opacity-30" />
                  <span className="text-xs uppercase tracking-[0.2em] opacity-40">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setReplyToId(
                      replyToId === comment.id ? null : comment.id
                    )
                  }
                  className="text-xs font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                >
                  {replyToId === comment.id ? "Cancel" : "Reply"}
                </button>
              </div>
              <p className="text-lg font-serif leading-relaxed opacity-90 pl-0 border-l-2 border-transparent transition-colors group-hover:border-current group-hover:pl-5">
                {comment.content}
              </p>

              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="mt-6 space-y-6 pl-6 sm:pl-10 border-l border-current border-opacity-10">
                  {getReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="group/reply">
                      <div className="flex items-center gap-3 mb-2">
                        <CornerDownRight className="w-3 h-3 opacity-30" />
                        <span className="font-bold tracking-[0.2em] uppercase text-[10px] opacity-80">
                          {reply.username}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-current opacity-30" />
                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">
                          {formatDate(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-base font-serif leading-relaxed opacity-80 pl-6">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Form */}
              {replyToId === comment.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(e, comment.id)}
                  className="mt-6 pl-6 sm:pl-10 animate-in fade-in slide-in-from-top-2 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CornerDownRight className="w-3 h-3 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                      Replying to {comment.username}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Your Name / Initial"
                    value={replyUsername}
                    onChange={(e) => setReplyUsername(e.target.value)}
                    required
                    maxLength={50}
                    className="w-full border-b border-current border-opacity-20 bg-transparent py-2 text-xs font-medium focus:border-opacity-100 focus:outline-none transition-colors"
                  />
                  <textarea
                    placeholder="Your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                    rows={2}
                    className="w-full border-b border-current border-opacity-20 bg-transparent py-2 text-xs font-medium focus:border-opacity-100 focus:outline-none transition-colors resize-none"
                  />
                  {replyError && (
                    <p className="text-[10px] text-red-500 font-medium">
                      {replyError}
                    </p>
                  )}
                  <button type="submit" disabled={submitting} className={btnClass}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Replying...
                      </span>
                    ) : (
                      "Post Reply"
                    )}
                  </button>
                </form>
              )}
            </div>
          ))}
          {mainComments.length === 0 && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">
              Be the first to leave a reflection.
            </p>
          )}
        </div>
      )}

      {/* Main Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 pt-10 border-t border-current border-opacity-10"
      >
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">
          Leave a new reflection
        </h4>
        <input
          type="text"
          placeholder="Your Name / Initial"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          maxLength={50}
          className="w-full border-b border-current border-opacity-20 bg-transparent py-3 text-sm font-medium focus:border-opacity-100 focus:outline-none transition-colors"
        />
        <textarea
          placeholder="Your quiet thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full border-b border-current border-opacity-20 bg-transparent py-3 text-sm font-medium focus:border-opacity-100 focus:outline-none transition-colors resize-none"
        />
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
        <button type="submit" disabled={submitting} className={btnLargeClass}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Posting...
            </span>
          ) : (
            "Post Reflection"
          )}
        </button>
      </form>
    </div>
  );
}
