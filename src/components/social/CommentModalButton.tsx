"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";

const Comments = dynamic(() => import("./Comments").then((m) => m.Comments), {
  ssr: false,
});

export function CommentModalButton({ 
  postId, 
  initialCount 
}: { 
  postId: string; 
  initialCount: number;
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <button 
        type="button"
        onClick={() => setShowComments(true)}
        className="group flex min-h-[44px] items-center gap-3 rounded-full border border-current/35 text-current/80 px-5 py-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:border-current hover:text-current hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <MessageCircle aria-hidden="true" className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>{initialCount} Reflections</span>
      </button>

      {showComments && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Refleksi dan Komentar"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200" 
          onClick={() => setShowComments(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-10 shadow-2xl bg-[#FAF8F5] text-[#2B303A] border border-black/10"
            onClick={e => e.stopPropagation()}
          >
            <button 
              type="button"
              aria-label="Tutup jendela refleksi"
              onClick={() => setShowComments(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B303A]"
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 hover:opacity-100 transition-opacity"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <Comments postId={postId} />
          </div>
        </div>
      )}
    </>
  );
}
