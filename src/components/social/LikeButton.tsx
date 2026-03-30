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
      onClick={handleLike}
      className={`group flex items-center gap-3 rounded-full border px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all
        ${hasLiked 
          ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10" 
          : "border-current opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
        }`}
    >
      <Heart className={`h-4 w-4 transition-transform group-hover:scale-110 ${hasLiked ? "fill-current" : ""}`} />
      <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}
