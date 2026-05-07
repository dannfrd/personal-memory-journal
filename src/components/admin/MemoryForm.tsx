/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveMemory } from "@/app/actions/memories";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MemoryForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.memory_date?.split("T")[0] || new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState(initialData?.location || "");
  const [mood, setMood] = useState(initialData?.mood || "");
  const [frameStyle, setFrameStyle] = useState(initialData?.frame_style || "minimal");

  // Original cover image (used for gallery — full, not cropped)
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  // 16:9 hero cropped file
  const [heroFiles, setHeroFiles] = useState<File[]>([]);

  const [existingCoverUrl, setExistingCoverUrl] = useState<string>(
    initialData?.cover_image_url || ""
  );
  const [existingHeroUrl, setExistingHeroUrl] = useState<string>(
    initialData?.hero_image_url || ""
  );
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(
    initialData?.post_images?.map((i: any) => i.image_url) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Upload failed");
    const { url, error: uploadError } = await uploadRes.json();
    if (uploadError) throw new Error(uploadError);
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !date) {
      toast.error("Description and date are required.");
      return;
    }

    // Must have at least a cover image (either existing or new)
    if (coverFiles.length === 0 && !existingCoverUrl) {
      toast.error("Please upload at least a cover photo.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? "Updating memory..." : "Creating memory...");

    try {
      // Upload cover (original full image)
      let coverImageUrl = existingCoverUrl;
      if (coverFiles.length > 0) {
        coverImageUrl = await uploadFile(coverFiles[0]);
      }

      // Upload hero crop (16:9) — optional
      let heroImageUrl: string | null = existingHeroUrl || null;
      if (heroFiles.length > 0) {
        heroImageUrl = await uploadFile(heroFiles[0]);
      }

      // Upload extra gallery images (index 1+)
      const newGalleryUrls: string[] = [];
      const extraCoverFiles = coverFiles.slice(1);
      for (const file of extraCoverFiles) {
        newGalleryUrls.push(await uploadFile(file));
      }

      const allGalleryImages = [...existingGalleryImages, ...newGalleryUrls];

      const postData = {
        title: title || null,
        coverImageUrl,
        heroImageUrl,
        frameStyle,
        description,
        memoryDate: new Date(date).toISOString(),
        location: location || null,
        mood: mood || null,
        galleryImages: allGalleryImages,
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

      {/* ── Section 1: Gallery Cover (full original) ── */}
      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">
              📸 Cover Galeri
            </h3>
            <p className="mt-1 text-xs opacity-40">
              Foto original — akan tampil di halaman galeri & detail memory. Boleh portrait atau landscape.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest dark:bg-white/5">
            Original
          </span>
        </div>
        <ImageUploader
          onFilesChange={(files) => setCoverFiles(files as File[])}
          onExistingUrlsChange={(urls) => {
            setExistingCoverUrl(urls[0] || "");
            setExistingGalleryImages(urls.slice(1));
          }}
          defaultImages={[
            ...(existingCoverUrl ? [existingCoverUrl] : []),
            ...existingGalleryImages,
          ]}
          isSubmitting={isSubmitting}
          cropMode="free"
          label="cover"
        />
        <p className="mt-2 text-xs opacity-40">
          Gambar pertama = cover. Gambar berikutnya masuk ke galeri detail.
        </p>
      </div>

      {/* ── Section 2: Hero Crop (16:9 khusus home) ── */}
      <div className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-6 shadow-sm dark:border-rose-800/30 dark:bg-rose-950/20">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              🏠 Hero Slider (Home)
            </h3>
            <p className="mt-1 text-xs opacity-50">
              Versi crop 16:9 — khusus tampil di hero slider halaman utama. Wajib horizontal.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            16:9 Crop
          </span>
        </div>
        <ImageUploader
          onFilesChange={(files) => setHeroFiles(files as File[])}
          onExistingUrlsChange={(urls) => setExistingHeroUrl(urls[0] || "")}
          defaultImages={existingHeroUrl ? [existingHeroUrl] : []}
          isSubmitting={isSubmitting}
          cropMode="hero"
          maxFiles={1}
          label="hero"
        />
        <p className="mt-2 text-xs opacity-40">
          Opsional — jika tidak diisi, akan menggunakan cover galeri sebagai fallback di hero slider.
        </p>
      </div>

      {/* ── Section 3: Memory Details ── */}
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

          <div>
            <label className="mb-2 block text-xs font-bold tracking-widest uppercase opacity-70">Frame Style</label>
            <select
              value={frameStyle}
              onChange={(e) => setFrameStyle(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm focus:border-black/30 focus:outline-none dark:border-white/10 dark:focus:border-white/30 [&>option]:text-black"
            >
              <option value="minimal">Minimal (Default)</option>
              <option value="polaroid">Polaroid Lucu</option>
              <option value="film">Film Strip</option>
              <option value="wavy">Wavy / Bergelombang</option>
              <option value="stamp">Perangko / Stamp</option>
            </select>
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
