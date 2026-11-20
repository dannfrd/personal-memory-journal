"use client";

import { useState, useEffect } from "react";
import { checkLikeStatus, likeMemory, unlikeMemory } from "@/app/actions/memories";
import { Heart } from "lucide-react";

export function LikeButton({ postId, initialCount = 0 }: { postId: string, initialCount?: number }) {
  const [likes, setLikes] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      let sessionId = localStorage.getItem("mj_session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("mj_session_id", sessionId);
      }

      const res = await checkLikeStatus(postId, sessionId);
      if (res.hasLiked) setHasLiked(true);
    };
    fetchLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    let sessionId = localStorage.getItem("mj_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("mj_session_id", sessionId);
    }

    if (hasLiked) {
      setHasLiked(false);
      setLikes(prev => prev - 1);
      await unlikeMemory(postId, sessionId);
    } else {
      setHasLiked(true);
      setLikes(prev => prev + 1);
      await likeMemory(postId, sessionId);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleLike}
      aria-pressed={hasLiked}
      className={`group flex min-h-[44px] items-center gap-3 rounded-full border px-5 py-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current
        ${hasLiked 
          ? "border-rose-700 bg-rose-700 text-white" 
          : "border-current/35 text-current/80 hover:border-current hover:text-current hover:bg-black/5 dark:hover:bg-white/5"
        }`}
    >
      <Heart aria-hidden="true" className={`h-4 w-4 transition-transform group-hover:scale-110 ${hasLiked ? "fill-current" : ""}`} />
      <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}
