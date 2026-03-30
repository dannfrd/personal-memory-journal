"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveMemory } from "@/app/actions/memories";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

export function MemoryForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.memory_date?.split("T")[0] || new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState(initialData?.location || "");
  const [mood, setMood] = useState(initialData?.mood || "");

  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData ? [initialData.cover_image_url, ...(initialData.post_images?.map((i: any) => i.image_url) || [])] : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !date) {
      toast.error("Description and date are required.");
      return;
    }

    if (files.length === 0 && existingImages.length === 0) {
      toast.error("Please select at least one image (Cover Image).");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? "Updating memory..." : "Creating memory...");

    try {
      const newImageUrls: string[] = [];

      // Upload new files
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadRes.ok) throw new Error("Upload failed");
          const { url, error: uploadError } = await uploadRes.json();
          if (uploadError) throw new Error(uploadError);
          
          newImageUrls.push(url);
        }
      }

      const allImages = [...existingImages, ...newImageUrls];
      const coverImageUrl = allImages[0];
      const galleryImages = allImages.slice(1);

      const postData = {
        title: title || null,
        coverImageUrl,
        description,
        memoryDate: new Date(date).toISOString(),
        location: location || null,
        mood: mood || null,
        galleryImages
      };

      const result = await saveMemory(postData, initialData?.id);
      if (!result.success) throw new Error(result.error);

      toast.success(isEditing ? "Memory updated!" : "Memory created!", { id: toastId });
      router.push("/admin/posts");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving memory:", error);
      toast.error(error.message || "An error occurred while saving.", { id: toastId });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest opacity-50">Images</h3>
        <ImageUploader
          onFilesChange={(newFiles) => setFiles(newFiles as File[])}
          onExistingUrlsChange={(urls) => setExistingImages(urls)}
          defaultImages={existingImages}
          isSubmitting={isSubmitting}
        />
        <p className="mt-2 text-xs opacity-50">The first image will be used as the cover photo in the gallery.</p>
      </div>

      <div className="space-y-6 rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Memory Details</h3>
        
        <div>
          <label className="mb-2 block text-xs font-bold tracking-widest uppercase opacity-70">Optional Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="A special evening..."
            className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm focus:border-black/30 focus:outline-none dark:border-white/10 dark:focus:border-white/30"
          />
        </div>

        <div>
           <label className="mb-2 block text-xs font-bold tracking-widest uppercase opacity-70">Description / Story *</label>
           <textarea
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             disabled={isSubmitting}
             required
             rows={5}
             placeholder="Tell the story of this memory..."
             className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm focus:border-black/30 focus:outline-none dark:border-white/10 dark:focus:border-white/30"
           />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
           <div>
             <label className="mb-2 block text-xs font-bold tracking-widest uppercase opacity-70">Date *</label>
             <input
               type="date"
               value={date}
               onChange={(e) => setDate(e.target.value)}
               disabled={isSubmitting}
               required
               className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm focus:border-black/30 focus:outline-none dark:border-white/10 dark:focus:border-white/30"
             />
           </div>
           
           <div>
             <label className="mb-2 block text-xs font-bold tracking-widest uppercase opacity-70">Location</label>
             <input
               type="text"
               value={location}
               onChange={(e) => setLocation(e.target.value)}
               disabled={isSubmitting}
               placeholder="e.g. Kyoto, Japan"
               className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm focus:border-black/30 focus:outline-none dark:border-white/10 dark:focus:border-white/30"
             />
           </div>

           <div>
             <label className="mb-2 block text-xs font-bold tracking-widest uppercase opacity-70">Mood (Optional)</label>
             <input
               type="text"
               value={mood}
               onChange={(e) => setMood(e.target.value)}
               disabled={isSubmitting}
               placeholder="e.g. Grateful, Nostalgic"
               className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm focus:border-black/30 focus:outline-none dark:border-white/10 dark:focus:border-white/30"
             />
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-w-[140px] items-center justify-center rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? "Save Changes" : "Post Memory")}
        </button>
      </div>
    </form>
  );
}
