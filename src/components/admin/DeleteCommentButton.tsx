"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteComment } from "@/app/actions/memories";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Hapus komentar ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setLoading(true);
    const res = await deleteComment(commentId);
    if (!res.success) {
      alert("Gagal menghapus komentar: " + res.error);
      setLoading(false);
    }
    // on success, revalidatePath will refresh the page automatically
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Hapus komentar"
      className="flex h-8 w-8 items-center justify-center rounded-md text-red-500/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
