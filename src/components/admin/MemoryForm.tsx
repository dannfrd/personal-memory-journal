/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveMemory } from "@/app/actions/memories";
import { Images, Loader2, Sparkles } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

export function MemoryForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(
    initialData?.memory_date?.split("T")[0] ||
      new Date().toISOString().split("T")[0]
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [mood, setMood] = useState(initialData?.mood || "");
  const [frameStyle, setFrameStyle] = useState(
    initialData?.frame_style || "minimal"
  );

  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [existingCoverUrl, setExistingCoverUrl] = useState<string>(
    initialData?.cover_image_url || ""
  );
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(
    initialData?.post_images?.map((i: any) => i.image_url) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");
    const { url, error: uploadError } = await uploadRes.json();
    if (uploadError) throw new Error(uploadError);
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !date) {
      toast.error("Cerita dan tanggal wajib diisi.");
      return;
    }

    if (coverFiles.length === 0 && !existingCoverUrl) {
      toast.error("Silakan unggah foto sampul terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Menyimpan perubahan..." : "Menyimpan memori..."
    );

    try {
      let coverImageUrl = existingCoverUrl;
      if (coverFiles.length > 0) {
        coverImageUrl = await uploadFile(coverFiles[0]);
      }

      const newGalleryUrls: string[] = [];
      for (let i = 0; i < galleryFiles.length; i += 3) {
        const batch = galleryFiles.slice(i, i + 3);
        const batchUrls = await Promise.all(
          batch.map((file) => uploadFile(file))
        );
        newGalleryUrls.push(...batchUrls);
      }

      const allGalleryImages = [...existingGalleryImages, ...newGalleryUrls];

      const postData = {
        title: title || null,
        coverImageUrl,
        heroImageUrl: coverImageUrl,
        frameStyle,
        description,
        memoryDate: new Date(date).toISOString(),
        location: location || null,
        mood: mood || null,
        galleryImages: allGalleryImages,
      };

      const result = await saveMemory(postData, initialData?.id);
      if (!result.success) throw new Error(result.error);

      toast.success(
        isEditing ? "Memori berhasil diperbarui!" : "Memori berhasil disimpan!",
        { id: toastId }
      );
      router.push("/admin/posts");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving memory:", error);
      toast.error(error.message || "Terjadi kesalahan saat menyimpan.", {
        id: toastId,
      });
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-black/15 bg-[#F6F3EC]/60 px-4 py-2.5 text-sm text-[#1F242D] placeholder:text-[#1F242D]/40 focus:border-[#1F242D] focus:bg-white focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Foto Sampul & Hero (16:9) */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F242D]">
              <Sparkles className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
              <span>Foto Sampul &amp; Hero Slider (Wajib)</span>
            </h3>
            <p className="mt-1 text-xs text-[#1F242D]/60">
              Otomatis di-crop 16:9 untuk tampil di halaman utama dan sampul galeri (maks. 1 foto).
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#F6F3EC] border border-black/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1F242D]/75">
            16:9 Crop
          </span>
        </div>
        <ImageUploader
          onFilesChange={(files) => setCoverFiles(files as File[])}
          onExistingUrlsChange={(urls) => setExistingCoverUrl(urls[0] || "")}
          defaultImages={existingCoverUrl ? [existingCoverUrl] : []}
          isSubmitting={isSubmitting}
          cropMode="hero"
          maxFiles={1}
          label="cover"
        />
      </div>

      {/* 2. Album Foto Tambahan */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F242D]">
              <Images className="h-3.5 w-3.5 text-[#1F242D]/70" aria-hidden="true" />
              <span>Album Foto Tambahan (Opsional)</span>
            </h3>
            <p className="mt-1 text-xs text-[#1F242D]/60">
              Foto-foto tambahan yang bisa digeser pada halaman detail memori.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#F6F3EC] border border-black/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1F242D]/75">
            Album
          </span>
        </div>
        <ImageUploader
          onFilesChange={(files) => setGalleryFiles(files as File[])}
          onExistingUrlsChange={(urls) => setExistingGalleryImages(urls)}
          defaultImages={existingGalleryImages}
          isSubmitting={isSubmitting}
          cropMode="free"
          label="gallery"
        />
      </div>

      {/* 3. Detail Cerita */}
      <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F242D]/70">
          Detail Cerita
        </h3>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1F242D]/80">
            Judul Memori
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="Contoh: Senja di Pantai Bali..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1F242D]/80">
            Cerita / Deskripsi *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            required
            rows={5}
            placeholder="Tuliskan cerita di balik momen ini..."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F242D]/80">
              Tanggal *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F242D]/80">
              Lokasi
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
              placeholder="Contoh: Yogyakarta"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F242D]/80">
              Suasana / Mood
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              disabled={isSubmitting}
              placeholder="Contoh: Bahagia, Tenang"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F242D]/80">
              Gaya Bingkai Foto
            </label>
            <select
              value={frameStyle}
              onChange={(e) => setFrameStyle(e.target.value)}
              disabled={isSubmitting}
              className={inputClass}
            >
              <option value="minimal">Minimal (Default)</option>
              <option value="polaroid">Polaroid</option>
              <option value="film">Film Strip</option>
              <option value="wavy">Wavy / Bergelombang</option>
              <option value="stamp">Perangko / Stamp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-full border border-black/15 bg-white px-6 py-2.5 text-xs font-semibold text-[#1F242D]/75 transition-colors hover:bg-black/5 hover:text-[#1F242D] disabled:opacity-40"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-w-[140px] items-center justify-center rounded-full bg-[#1F242D] px-6 py-2.5 text-xs font-semibold text-[#F6F3EC] shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : isEditing ? (
            "Simpan Perubahan"
          ) : (
            "Simpan Memori"
          )}
        </button>
      </div>
    </form>
  );
}
