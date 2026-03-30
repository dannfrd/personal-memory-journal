"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Comments } from "./Comments";

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
        onClick={() => setShowComments(true)}
        className="group flex items-center gap-3 rounded-full border border-current opacity-60 px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
      >
        <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>{initialCount} Reflections</span>
      </button>

      {showComments && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-300" 
          onClick={() => setShowComments(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 sm:p-12 shadow-2xl bg-[#EAE5DF] text-[#2B303A]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowComments(false)}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 hover:opacity-100 transition-opacity"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <Comments postId={postId} />
          </div>
        </div>
      )}
    </>
  );
}
