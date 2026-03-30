"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMemory } from "@/app/actions/memories";
import { toast } from "sonner";

export function DeleteMemoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this memory? This action cannot be undone.")) return;
    
    setLoading(true);
    const result = await deleteMemory(id);
    
    if (!result.success) {
      toast.error(`Failed to delete: ${result.error}`);
      setLoading(false);
    } else {
      toast.success("Memory deleted.");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
      title="Delete Memory"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
