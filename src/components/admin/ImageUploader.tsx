"use client";

import { Crop as CropIcon, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageCropper } from "./ImageCropper";

/** 
 * cropMode:
 *  - "free"  → tidak ada crop (gambar original dipakai langsung) → untuk galeri
 *  - "hero"  → crop wajib 16:9 → untuk hero slider home
 */
export type CropMode = "free" | "hero";

const MAX_CLIENT_FILE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2200;
const JPEG_QUALITY = 0.86;
const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

function isHeicFile(file: File) {
  const name = file.name.toLowerCase();
  return HEIC_MIME_TYPES.has(file.type) || name.endsWith(".heic") || name.endsWith(".heif");
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const output = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const blob = Array.isArray(output) ? output[0] : output;
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}

async function prepareImageFile(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const img = await loadImageFromFile(file);
  const maxDim = MAX_IMAGE_DIMENSION;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));

  const shouldReencode = scale < 1 || file.size > 3 * 1024 * 1024;
  if (!shouldReencode) return file;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const outputQuality = outputType === "image/jpeg" ? JPEG_QUALITY : undefined;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Image conversion failed"))),
      outputType,
      outputQuality
    );
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const extension = outputType === "image/png" ? "png" : "jpg";
  return new File([blob], `${baseName}_optimized.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

interface MultiImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  onExistingUrlsChange?: (urls: string[]) => void;
  defaultImages?: string[];
  isSubmitting?: boolean;
  cropMode?: CropMode;
  maxFiles?: number;
  label?: string;
}

interface PendingCrop {
  file: File;
  previewUrl: string;
}

export function ImageUploader({
  onFilesChange,
  onExistingUrlsChange,
  defaultImages = [],
  isSubmitting = false,
  cropMode = "free",
  maxFiles,
  label = "image",
}: MultiImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);

  // Crop state
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (defaultImages.length > 0) setExistingUrls(defaultImages);
  }, [defaultImages]);

  // Check if max reached
  const totalCount = existingUrls.length + selectedFiles.length;
  const isMaxReached = maxFiles !== undefined && totalCount >= maxFiles;

  const openCrop = useCallback((file: File, index: number | null) => {
    const previewUrl = URL.createObjectURL(file);
    setPendingCrop({ file, previewUrl });
    setCropTargetIndex(index);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const incomingFiles = Array.from(files);
      e.target.value = "";
      
      if (cropMode === "hero") {
        // Always open crop for hero mode
        let file = incomingFiles[0];
        if (isHeicFile(file)) {
          try {
            file = await convertHeicToJpeg(file);
          } catch {
            toast.error("Gagal mengonversi HEIC. Coba ubah ke JPG terlebih dulu.");
            return;
          }
        }
        if (file.size > MAX_CLIENT_FILE_BYTES) {
          toast.error("Ukuran gambar terlalu besar (maks 25MB). Coba kompres dulu.");
          return;
        }
        openCrop(file, null);
      } else {
        // Free mode: add directly without crop
        const preparedFiles = await Promise.all(
          incomingFiles.map(async (file) => {
            let normalizedFile = file;
            if (isHeicFile(file)) {
              try {
                normalizedFile = await convertHeicToJpeg(file);
              } catch {
                toast.error("Gagal mengonversi HEIC. Coba ubah ke JPG terlebih dulu.");
                return null;
              }
            }
            if (normalizedFile.size > MAX_CLIENT_FILE_BYTES) {
              toast.error("Ukuran gambar terlalu besar (maks 25MB). Coba kompres dulu.");
              return null;
            }
            try {
              return await prepareImageFile(normalizedFile);
            } catch {
              toast.error("Gagal memproses gambar. Coba upload ulang.");
              return null;
            }
          })
        );

        const newFiles = preparedFiles.filter(Boolean) as File[];
        if (newFiles.length === 0) return;

        setSelectedFiles((prev) => {
          const updated = [...prev, ...newFiles];
          onFilesChange(updated);
          return updated;
        });
        
        setPreviews((prev) => {
          const newPreviews = newFiles.map(file => URL.createObjectURL(file));
          return [...prev, ...newPreviews];
        });
      }
    },
    [cropMode, openCrop, onFilesChange]
  );

  const openRecrop = useCallback(
    (index: number) => {
      const file = selectedFiles[index];
      if (!file) return;
      openCrop(file, index);
    },
    [selectedFiles, openCrop]
  );

  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      if (pendingCrop) URL.revokeObjectURL(pendingCrop.previewUrl);
      const newPreview = URL.createObjectURL(croppedFile);

      if (cropTargetIndex !== null) {
        // Replace existing preview
        setSelectedFiles((prev) => {
          const updated = [...prev];
          updated[cropTargetIndex] = croppedFile;
          onFilesChange(updated);
          return updated;
        });
        setPreviews((prev) => {
          const updated = [...prev];
          URL.revokeObjectURL(updated[cropTargetIndex]);
          updated[cropTargetIndex] = newPreview;
          return updated;
        });
      } else {
        // New file
        setSelectedFiles((prev) => {
          const updated = [...prev, croppedFile];
          onFilesChange(updated);
          return updated;
        });
        setPreviews((prev) => [...prev, newPreview]);
      }

      setPendingCrop(null);
      setCropTargetIndex(null);
    },
    [pendingCrop, cropTargetIndex, onFilesChange]
  );

  const handleCropCancel = useCallback(() => {
    if (pendingCrop) URL.revokeObjectURL(pendingCrop.previewUrl);
    setPendingCrop(null);
    setCropTargetIndex(null);
  }, [pendingCrop]);

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  const removeExisting = (index: number) => {
    const newUrls = [...existingUrls];
    newUrls.splice(index, 1);
    setExistingUrls(newUrls);
    if (onExistingUrlsChange) onExistingUrlsChange(newUrls);
  };

  const isHeroMode = cropMode === "hero";
  // hero mode uses fixed 16:9 aspect, free mode uses aspect-square for thumbnails in grid
  const thumbClass = isHeroMode ? "aspect-video" : "aspect-square";

  return (
    <>
      {/* Crop Modal */}
      {pendingCrop && (
        <ImageCropper
          src={pendingCrop.previewUrl}
          fileName={pendingCrop.file.name}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={isHeroMode ? 16 / 9 : undefined}
          mode={cropMode}
        />
      )}

      <div className="w-full">
        {/* Drop zone */}
        {!isMaxReached && (
          <div className={`relative mb-4 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isHeroMode ? "border-rose-300/60 bg-rose-50/30 hover:bg-rose-50/60 dark:border-rose-700/30 dark:bg-rose-950/10 dark:hover:bg-rose-950/20" : "border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple={cropMode !== "hero"}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            <UploadCloud className={`mb-4 h-10 w-10 opacity-50 ${isHeroMode ? "text-rose-500" : ""}`} />
            <p className="mb-1 text-sm font-medium">
              {isHeroMode ? "Upload foto untuk Hero Slider" : "Click atau drag gambar untuk upload"}
            </p>
            <p className="text-xs opacity-50">PNG, JPG, GIF, atau HEIC (max. 25MB)</p>
            {isHeroMode && (
              <p className="mt-2 text-xs font-semibold text-rose-500/80">
                ✂️ Crop 16:9 otomatis terbuka — pastikan area yang dipilih terlihat bagus di layar penuh
              </p>
            )}
          </div>
        )}

        {isMaxReached && (
          <p className="mb-4 text-center text-xs opacity-40">
            Maksimum {maxFiles} gambar untuk bagian ini.{" "}
            <span className="opacity-60">Hapus yang ada untuk mengganti.</span>
          </p>
        )}

        {(previews.length > 0 || existingUrls.length > 0) && (
          <div className={`grid gap-4 ${isHeroMode ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
            {/* Existing URLs */}
            {existingUrls.map((url, i) => (
              <div key={`existing-${i}`} className={`relative ${thumbClass} overflow-hidden rounded-lg bg-black/5`}>
                <Image
                  src={url}
                  alt={`Existing ${i}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-0 left-0 bg-black/70 px-2 py-1 text-[10px] text-white font-bold uppercase tracking-widest rounded-br-lg z-10">
                  {isHeroMode ? "HERO" : i === 0 ? "COVER" : `IMG ${i}`}
                </div>
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {/* New previews */}
            {previews.map((preview, i) => {
              const globalIndex = existingUrls.length + i;
              return (
                <div key={`new-${i}`} className={`relative ${thumbClass} overflow-hidden rounded-lg bg-black/5 group`}>
                  <Image src={preview} alt={`Preview ${i}`} fill className="object-cover" unoptimized />
                  <div className="absolute top-0 left-0 bg-black/70 px-2 py-1 text-[10px] text-white font-bold uppercase tracking-widest rounded-br-lg z-10">
                    {isHeroMode ? "HERO NEW" : globalIndex === 0 ? "COVER" : "NEW IMG"}
                  </div>

                  {!isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 z-10">
                      {/* Re-crop only for hero mode */}
                      {isHeroMode && (
                        <button
                          type="button"
                          onClick={() => openRecrop(i)}
                          className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black transition-transform hover:scale-105"
                        >
                          <CropIcon className="h-3 w-3" />
                          Re-crop
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="rounded-full bg-red-500 p-1.5 text-white transition-transform hover:scale-105"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
