"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface MultiImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  onExistingUrlsChange?: (urls: string[]) => void;
  defaultImages?: string[];
  isSubmitting?: boolean;
}

export function ImageUploader({ onFilesChange, onExistingUrlsChange, defaultImages = [], isSubmitting = false }: MultiImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);

  useEffect(() => {
    if (defaultImages.length > 0) {
      setExistingUrls(defaultImages);
    }
  }, [defaultImages]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));

      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      onFilesChange([...selectedFiles, ...newFiles]);
    },
    [onFilesChange, selectedFiles]
  );

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
    <div className="w-full">
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
        <p className="text-xs opacity-50">SVG, PNG, JPG or GIF (max. 10MB each)</p>
      </div>

      {(previews.length > 0 || existingUrls.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {existingUrls.map((url, i) => (
            <div key={`existing-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-black/5">
              <Image src={url} alt={`Existing ${i}`} fill className="object-cover" unoptimized />
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

          {previews.map((preview, i) => {
            const globalIndex = existingUrls.length + i;
            return (
            <div key={`new-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-black/5">
              <Image src={preview} alt={`Preview ${i}`} fill className="object-cover" unoptimized />
              <div className="absolute top-0 left-0 bg-black/70 px-2 py-1 text-[10px] text-white font-bold uppercase tracking-widest rounded-br-lg z-10">
                {globalIndex === 0 ? "COVER" : `NEW IMG`}
              </div>
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500 z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
