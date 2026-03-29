"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Comment } from "@/src/types";
import { formatDate } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (data) setComments(data);
      setLoading(false);
    };
    fetchComments();
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !content.trim()) return;
    
    setSubmitting(true);
    const newComment = { post_id: postId, username, content };
    
    const { data, error } = await supabase
      .from("comments")
      .insert([newComment])
      .select()
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data]);
      setContent("");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-20 border-t border-current border-opacity-10 pt-16 w-full max-w-2xl">
      <h3 className="mb-10 font-serif text-3xl tracking-tight opacity-90">Reflections ({comments.length})</h3>
      
      {loading ? (
        <div className="py-8 text-center opacity-50"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="space-y-10 mb-16">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold tracking-[0.2em] uppercase text-xs opacity-80">{comment.username}</span>
                <span className="h-1 w-1 rounded-full bg-current opacity-30"></span>
                <span className="text-xs uppercase tracking-[0.2em] opacity-40">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-lg font-serif leading-relaxed opacity-90 pl-0 border-l-2 border-transparent transition-colors group-hover:border-current group-hover:pl-5">
                {comment.content}
              </p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Be the first to leave a reflection.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Leave a reflection</h4>
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
        <button 
          type="submit" 
          disabled={submitting}
          className="mt-4 self-start rounded-full border border-current px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-current hover:text-white hover:bg-opacity-10 disabled:opacity-50 dark:hover:text-black dark:hover:bg-opacity-100"
        >
          {submitting ? "Posting..." : "Post Reflection"}
        </button>
      </form>
    </div>
  );
}
