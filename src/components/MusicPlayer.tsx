"use client";

import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  src?: string;
  title?: string;
  tracks?: { src: string; title: string }[];
  defaultVolume?: number;
}

export function MusicPlayer({
  src,
  title,
  tracks,
  defaultVolume = 0.3,
}: MusicPlayerProps) {
  const resolvedSrc = src ?? process.env.NEXT_PUBLIC_MUSIC_URL;
  const resolvedTitle = title ?? process.env.NEXT_PUBLIC_MUSIC_TITLE;
  const defaultTracks = [
    {
      src: "/audio/Ghea Indrawari - 1000X (Official Visualizer).mp3",
      title: "Ghea Indrawari - 1000X",
    },
    {
      src: "/audio/Nadhif Basalamah (with Aziz Harun & Aisha Retno) - kota ini tak sama tanpamu (Official Lyric Video).mp3",
      title: "Nadhif Basalamah - kota ini tak sama tanpamu",
    },
  ];
  const envTracks = resolvedSrc
    ? [{ src: resolvedSrc, title: resolvedTitle ?? "Ambient" }]
    : [];
  const resolvedTracks = tracks?.length ? tracks : envTracks.length ? envTracks : defaultTracks;
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeIndex = resolvedTracks.length
    ? Math.min(currentIndex, resolvedTracks.length - 1)
    : 0;
  const currentTrack = resolvedTracks[safeIndex] ?? resolvedTracks[0];
  const encodedSrc = currentTrack ? encodeURI(currentTrack.src) : "";
  const isRemoteSource = currentTrack ? /^https?:\/\//.test(currentTrack.src) : false;
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [volume, setVolume] = useState(defaultVolume);
  const [autoPlayOnLoad, setAutoPlayOnLoad] = useState(true);
  const hasMultipleTracks = resolvedTracks.length > 1;
  const isReady = encodedSrc !== "" && readySrc === encodedSrc;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!hasMultipleTracks) return;
    setAutoPlayOnLoad(isPlaying);
    setCurrentIndex((prev) => {
      const base = resolvedTracks.length
        ? Math.min(prev, resolvedTracks.length - 1)
        : 0;
      return base === resolvedTracks.length - 1 ? 0 : base + 1;
    });
  };

  const handlePrev = () => {
    if (!hasMultipleTracks) return;
    setAutoPlayOnLoad(isPlaying);
    setCurrentIndex((prev) => {
      const base = resolvedTracks.length
        ? Math.min(prev, resolvedTracks.length - 1)
        : 0;
      return base === 0 ? resolvedTracks.length - 1 : base - 1;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 text-[#2B303A]">
      <audio
        ref={audioRef}
        src={encodedSrc}
        autoPlay
        playsInline
        loop={!hasMultipleTracks}
        preload="metadata"
        crossOrigin={isRemoteSource ? "anonymous" : undefined}
        onCanPlay={() => {
          setReadySrc(encodedSrc);
          if (autoPlayOnLoad) {
            audioRef.current?.play().catch(() => setIsPlaying(false));
            setAutoPlayOnLoad(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleNext}
      />
      <div className="flex w-[320px] max-w-[90vw] items-center gap-3 rounded-full border border-black/10 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
          disabled={!isReady}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B303A] text-white transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous track"
            disabled={!hasMultipleTracks}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#2B303A] transition-transform hover:scale-105 disabled:opacity-40"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next track"
            disabled={!hasMultipleTracks}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#2B303A] transition-transform hover:scale-105 disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">Now Playing</span>
          <span className="truncate text-xs font-semibold">
            {currentTrack?.title ?? resolvedTitle ?? "Untitled"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Collapse player" : "Expand player"}
          aria-expanded={isOpen}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#2B303A] transition-transform hover:scale-105"
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>
      {isOpen && (
        <div className="flex w-[320px] max-w-[90vw] items-center gap-3 rounded-2xl border border-black/10 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-md">
          <Volume2 className="h-4 w-4 opacity-60" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="h-1 w-full accent-[#2B303A]"
            aria-label="Music volume"
          />
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">
            {currentIndex + 1}/{resolvedTracks.length}
          </span>
        </div>
      )}
    </div>
  );
}
