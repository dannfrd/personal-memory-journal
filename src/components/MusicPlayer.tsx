"use client";

import {
  Check,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  src?: string;
  title?: string;
  tracks?: { src: string; title: string; artist?: string }[];
  defaultVolume?: number;
}

const DEFAULT_TRACKS = [
  {
    src: "/audio/nadhif-kota-ini.mp3",
    title: "kota ini tak sama tanpamu",
    artist: "Nadhif Basalamah",
  },
  {
    src: "/audio/Backstreet Boys - Shape Of My Heart (Official HD Video).mp3",
    title: "Shape Of My Heart",
    artist: "Backstreet Boys",
  },
  {
    src: "/audio/ghea-1000x.mp3",
    title: "1000X",
    artist: "Ghea Indrawari",
  },
];

export function MusicPlayer({
  src,
  title,
  tracks,
  defaultVolume = 0.35,
}: MusicPlayerProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const resolvedSrc = src ?? process.env.NEXT_PUBLIC_MUSIC_URL;
  const resolvedTitle = title ?? process.env.NEXT_PUBLIC_MUSIC_TITLE;

  const envTracks = resolvedSrc
    ? [{ src: resolvedSrc, title: resolvedTitle ?? "Ambient", artist: "Lovelog" }]
    : [];
  const resolvedTracks = tracks?.length
    ? tracks
    : envTracks.length
      ? envTracks
      : DEFAULT_TRACKS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const safeIndex = resolvedTracks.length
    ? Math.min(currentIndex, resolvedTracks.length - 1)
    : 0;
  const currentTrack = resolvedTracks[safeIndex] ?? resolvedTracks[0];

  const encodedSrc = currentTrack
    ? currentTrack.src
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/")
    : "";
  const isRemoteSource = currentTrack
    ? /^https?:\/\//.test(currentTrack.src)
    : false;

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldPlayNextRef = useRef(false);
  const hasMultipleTracks = resolvedTracks.length > 1;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Close popover when clicking outside
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

  const attemptPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.readyState < 2) {
      audio.load();
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await attemptPlay();
    } else {
      audio.pause();
    }
  };

  const selectTrack = (index: number) => {
    shouldPlayNextRef.current = true;
    setCurrentIndex(index);
    if (index === safeIndex && audioRef.current?.paused) {
      attemptPlay();
    }
  };

  const handleNext = () => {
    if (!hasMultipleTracks) return;
    shouldPlayNextRef.current = isPlaying;
    setCurrentIndex((prev) =>
      prev >= resolvedTracks.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    if (!hasMultipleTracks) return;
    shouldPlayNextRef.current = isPlaying;
    setCurrentIndex((prev) =>
      prev <= 0 ? resolvedTracks.length - 1 : prev - 1
    );
  };

  // Hide UI on admin pages while keeping the component mounted
  if (isAdminRoute) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <audio
        ref={audioRef}
        src={encodedSrc}
        playsInline
        loop={!hasMultipleTracks}
        preload="none"
        crossOrigin={isRemoteSource ? "anonymous" : undefined}
        onCanPlay={() => {
          if (shouldPlayNextRef.current) {
            shouldPlayNextRef.current = false;
            attemptPlay();
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          shouldPlayNextRef.current = true;
          setCurrentIndex((prev) =>
            prev >= resolvedTracks.length - 1 ? 0 : prev + 1
          );
        }}
      />

      {/* Sleek Navbar Pill Control */}
      <div className="inline-flex items-center rounded-full border border-black/15 bg-white/85 p-1 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Jeda musik" : "Putar musik"}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            isPlaying
              ? "bg-amber-900 text-white"
              : "bg-[#1F242D] text-[#F6F3EC] hover:bg-amber-900"
          }`}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-0.5" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Buka daftar lagu dan pengatur suara"
          className="flex items-center gap-2 px-2.5 py-1 text-left transition-colors hover:text-amber-900 focus:outline-none"
        >
          {/* Equalizer Bars when playing, Music icon when paused */}
          {isPlaying ? (
            <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
              <span className="w-0.5 h-2.5 bg-amber-800 rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-amber-800 rounded-full animate-bounce" />
              <span className="w-0.5 h-2 bg-amber-800 rounded-full animate-pulse" />
            </span>
          ) : (
            <Music className="h-3.5 w-3.5 text-[#1F242D]/60" aria-hidden="true" />
          )}

          <span className="max-w-[96px] sm:max-w-[130px] truncate text-[11px] font-semibold text-[#1F242D]">
            {isPlaying ? currentTrack?.title : " Soundtrack"}
          </span>
        </button>
      </div>

      {/* Dropdown Popover: Tracklist, Controls & Volume */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-72 sm:w-80 rounded-2xl border border-black/10 bg-[#FAF8F5] p-4 text-[#1F242D] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Current Track Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/10">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-900">
                {isPlaying ? "Now Playing" : "Audio Journal"}
              </p>
              <p className="mt-0.5 truncate font-serif text-base font-bold text-[#1F242D]">
                {currentTrack?.title}
              </p>
              {currentTrack?.artist && (
                <p className="truncate text-xs text-[#1F242D]/60">
                  {currentTrack.artist}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasMultipleTracks}
                aria-label="Lagu sebelumnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#1F242D] hover:bg-black/5 disabled:opacity-40"
              >
                <SkipBack className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isPlaying ? "Jeda" : "Putar"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F242D] text-[#FAF8F5] hover:bg-amber-900 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4 translate-x-0.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasMultipleTracks}
                aria-label="Lagu berikutnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#1F242D] hover:bg-black/5 disabled:opacity-40"
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Playlist Selector */}
          {resolvedTracks.length > 1 && (
            <div className="py-2.5 border-b border-black/10 space-y-1">
              <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#1F242D]/50">
                Pilih Soundtrack ({resolvedTracks.length})
              </p>
              {resolvedTracks.map((track, idx) => {
                const active = idx === safeIndex;
                return (
                  <button
                    key={track.src}
                    type="button"
                    onClick={() => selectTrack(idx)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                      active
                        ? "bg-[#1F242D] text-[#FAF8F5] font-semibold"
                        : "hover:bg-black/5 text-[#1F242D]/80"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{track.title}</p>
                      {track.artist && (
                        <p
                          className={`truncate text-[10px] ${
                            active ? "text-[#FAF8F5]/70" : "text-[#1F242D]/50"
                          }`}
                        >
                          {track.artist}
                        </p>
                      )}
                    </div>
                    {active && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Volume Control */}
          <div className="pt-3 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? "Aktifkan suara" : "Bisukan suara"}
              className="text-[#1F242D]/70 hover:text-[#1F242D]"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : Math.round(volume * 100)}
              onChange={(event) => {
                setIsMuted(false);
                setVolume(Number(event.target.value) / 100);
              }}
              className="h-1.5 w-full cursor-pointer accent-[#1F242D]"
              aria-label="Volume musik"
            />
            <span className="w-8 text-right font-mono text-[10px] text-[#1F242D]/60">
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
