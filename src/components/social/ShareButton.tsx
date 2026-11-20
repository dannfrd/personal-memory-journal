"use client";

import { getMemoryUrl } from "@/src/lib/utils";
import { Check, Copy, Send, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  memory: {
    id: string;
    title?: string | null;
    description?: string | null;
    location?: string | null;
  };
  variant?: "pill" | "icon";
}

export function ShareButton({ memory, variant = "pill" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const relativePath = getMemoryUrl(memory);

  const getFullUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${relativePath}`;
    }
    return `https://lovelog.my.id${relativePath}`;
  };

  const shareTitle = memory.title
    ? `${memory.title} — Lovelog Memory Journal`
    : "Lovelog — Personal Memory Journal";
  const shareText = memory.description
    ? memory.description.length > 110
      ? `${memory.description.slice(0, 110)}...`
      : memory.description
    : "Lihat kepingan memori ini di Lovelog.";

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCopyLink = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getFullUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Tautan memori berhasil disalin!");
      setTimeout(() => setCopied(false), 2500);
      setIsOpen(false);
    } catch {
      toast.error("Gagal menyalin tautan.");
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getFullUrl();

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        setIsOpen(false);
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getFullUrl();
    const text = encodeURIComponent(`${shareTitle}\n"${shareText}"\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleTelegramShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = encodeURIComponent(getFullUrl());
    const text = encodeURIComponent(`${shareTitle} — ${shareText}`);
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
    setIsOpen(false);
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = encodeURIComponent(getFullUrl());
    const text = encodeURIComponent(`${shareTitle}\n${shareText}`);
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Bagikan memori ini"
          aria-expanded={isOpen}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#1F242D]/60 transition-colors hover:bg-black/5 hover:text-[#1F242D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F242D]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
          ) : (
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Bagikan memori ini"
          aria-expanded={isOpen}
          className="group flex min-h-[44px] items-center gap-2.5 rounded-full border border-current/35 text-current/80 px-5 py-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:border-current hover:text-current hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          ) : (
            <Share2
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:scale-110"
            />
          )}
          <span>{copied ? "Tersalin" : "Share"}</span>
        </button>
      )}

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-2.5 z-50 w-56 rounded-2xl border border-black/10 bg-[#FAF8F5] p-2 text-[#1F242D] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-[#1F242D]/50">
            Bagikan Memori
          </p>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1F242D] transition-colors hover:bg-black/5"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#1F242D]/70" aria-hidden="true" />
            )}
            <span>Salin Tautan (Copy Link)</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1F242D] transition-colors hover:bg-black/5"
          >
            <Send className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Bagikan ke WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleTelegramShare}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1F242D] transition-colors hover:bg-black/5"
          >
            <Send className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
            <span>Bagikan ke Telegram</span>
          </button>

          <button
            type="button"
            onClick={handleTwitterShare}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1F242D] transition-colors hover:bg-black/5"
          >
            <Share2 className="h-3.5 w-3.5 text-[#1F242D]/70" aria-hidden="true" />
            <span>Bagikan ke X / Twitter</span>
          </button>

          {typeof navigator !== "undefined" &&
            typeof navigator.share === "function" && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="mt-1 border-t border-black/10 pt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-amber-900 transition-colors hover:bg-black/5"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Aplikasi Lainnya...</span>
              </button>
            )}
        </div>
      )}
    </div>
  );
}
