"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadCloud, X, Crop as CropIcon } from "lucide-react";
import Image from "next/image";
import { ImageCropper } from "./ImageCropper";

interface MultiImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  onExistingUrlsChange?: (urls: string[]) => void;
  defaultImages?: string[];
  isSubmitting?: boolean;
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
}: MultiImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);

  // State for crop modal
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);
  // Index of the file being re-cropped (-1 = new file not yet appended)
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (defaultImages.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingUrls(defaultImages);
    }
  }, [defaultImages]);

  // Open cropper for a NEW file coming from input
  const openCropForNew = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPendingCrop({ file, previewUrl });
    setCropTargetIndex(null); // null = new file
  }, []);

  // Open cropper to re-crop an existing preview
  const openRecrop = useCallback(
    (index: number) => {
      const file = selectedFiles[index];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      setPendingCrop({ file, previewUrl });
      setCropTargetIndex(index);
    },
    [selectedFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      // Process files one by one: open crop for the first, queue the rest
      // For simplicity we open crop for each sequentially via a queue
      const newFiles = Array.from(files);
      // Open crop for the first file; others will be enqueued
      openCropForNew(newFiles[0]);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [openCropForNew]
  );

  // Called when user confirms crop
  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      if (pendingCrop) URL.revokeObjectURL(pendingCrop.previewUrl);

      const newPreview = URL.createObjectURL(croppedFile);

      if (cropTargetIndex !== null) {
        // Replacing an existing preview
        setSelectedFiles((prev) => {
          const updated = [...prev];
          updated[cropTargetIndex] = croppedFile;
          const newFiles = updated;
          onFilesChange(newFiles);
          return newFiles;
        });
        setPreviews((prev) => {
          const updated = [...prev];
          URL.revokeObjectURL(updated[cropTargetIndex]);
          updated[cropTargetIndex] = newPreview;
          return updated;
        });
      } else {
        // Adding a new file
        setSelectedFiles((prev) => {
          const newFiles = [...prev, croppedFile];
          onFilesChange(newFiles);
          return newFiles;
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
    if (onExistingUrlsChange) {
      onExistingUrlsChange(newUrls);
    }
  };

  return (
    <>
      {/* Crop Modal */}
      {pendingCrop && (
        <ImageCropper
          src={pendingCrop.previewUrl}
          fileName={pendingCrop.file.name}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={16 / 9}
        />
      )}

      <div className="w-full">
        {/* Drop zone */}
        <div className="relative mb-4 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-black/5 p-8 text-center transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
          <UploadCloud className="mb-4 h-10 w-10 opacity-50" />
          <p className="mb-1 text-sm font-medium">Click or drag images to upload</p>
          <p className="text-xs opacity-50">PNG, JPG or GIF (max. 10MB each)</p>
          <p className="mt-2 text-xs font-medium text-rose-500/70">
            ✂️ Crop otomatis terbuka setelah memilih gambar
          </p>
        </div>

        {(previews.length > 0 || existingUrls.length > 0) && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Existing images (from DB) */}
            {existingUrls.map((url, i) => (
              <div
                key={`existing-${i}`}
                className="relative aspect-video overflow-hidden rounded-lg bg-black/5"
              >
                <Image
                  src={url}
                  alt={`Existing ${i}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-0 left-0 bg-black/70 px-2 py-1 text-[10px] text-white font-bold uppercase tracking-widest rounded-br-lg z-10">
                  {i === 0 ? "COVER" : `IMG ${i}`}
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

            {/* New previews (cropped files) */}
            {previews.map((preview, i) => {
              const globalIndex = existingUrls.length + i;
              return (
                <div
                  key={`new-${i}`}
                  className="relative aspect-video overflow-hidden rounded-lg bg-black/5 group"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-0 left-0 bg-black/70 px-2 py-1 text-[10px] text-white font-bold uppercase tracking-widest rounded-br-lg z-10">
                    {globalIndex === 0 ? "COVER" : "NEW IMG"}
                  </div>

                  {!isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 z-10">
                      {/* Re-crop button */}
                      <button
                        type="button"
                        onClick={() => openRecrop(i)}
                        className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black transition-transform hover:scale-105"
                      >
                        <CropIcon className="h-3 w-3" />
                        Re-crop
                      </button>
                      {/* Remove button */}
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
