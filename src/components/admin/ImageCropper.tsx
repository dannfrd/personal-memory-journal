"use client";

import { Check, CropIcon, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  src: string;
  fileName: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspect?: number;
  /** "hero" = locked 16:9 for home slider | "free" = no forced ratio */
  mode?: "hero" | "free";
}

const MAX_CROP_DIMENSION = 2400;
const JPEG_QUALITY = 0.86;

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({
  src,
  fileName,
  onCropComplete,
  onCancel,
  aspect,
  mode = "hero",
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);

  // hero mode = locked 16:9, free mode = no restriction
  const effectiveAspect = mode === "hero" ? (aspect ?? 16 / 9) : aspect;

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
      if (effectiveAspect) {
        setCrop(centerAspectCrop(width, height, effectiveAspect));
      } else {
        // Free mode: start with a wide default selection
        setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
      }
    },
    [effectiveAspect]
  );

  const handleConfirm = useCallback(async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelCrop = {
        x: (completedCrop.x / 100) * image.width * scaleX,
        y: (completedCrop.y / 100) * image.height * scaleY,
        width: (completedCrop.width / 100) * image.width * scaleX,
        height: (completedCrop.height / 100) * image.height * scaleY,
      };

      const scale = Math.min(1, MAX_CROP_DIMENSION / Math.max(pixelCrop.width, pixelCrop.height));
      const outputWidth = Math.max(1, Math.round(pixelCrop.width * scale));
      const outputHeight = Math.max(1, Math.round(pixelCrop.height * scale));

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const baseName = fileName.replace(/\.[^/.]+$/, "");
          const croppedName = `${baseName}_cropped.jpg`;
          const croppedFile = new File([blob], croppedName, {
            type: blob.type,
            lastModified: Date.now(),
          });
          onCropComplete(croppedFile);
          setIsProcessing(false);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    } catch {
      setIsProcessing(false);
    }
  }, [completedCrop, fileName, onCropComplete]);

  return (
    // Modal backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <CropIcon className="h-4 w-4 opacity-60" />
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">
              Crop Image
            </h3>
          </div>
          <p className="text-xs opacity-40 hidden sm:block">
            Drag to reposition • Drag corners to resize
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-800 min-h-0">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
            aspect={effectiveAspect}
            minWidth={10}
            className="max-h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[60vh] max-w-full object-contain"
            />
          </ReactCrop>
        </div>

        {/* Ratio hint */}
        <div className="px-5 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-black/5 dark:border-white/5 shrink-0">
          <p className="text-[11px] opacity-50 text-center">
            {mode === "hero"
              ? "Rasio 16:9 terkunci — pilih area yang ingin tampil di Hero Slider home"
              : "Crop bebas — pilih area terbaik untuk ditampilkan"}
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-black/10 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest opacity-60 transition-opacity hover:opacity-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop || isProcessing}
            className="flex items-center gap-2 rounded-full bg-black dark:bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Check className="h-3.5 w-3.5" />
            {isProcessing ? "Processing..." : "Gunakan Crop Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}
