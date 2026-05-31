"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  src?: string;
  title?: string;
  defaultVolume?: number;
  spotifyEmbedUrl?: string;
}

export function MusicPlayer({
  src,
  title,
  defaultVolume = 0.3,
  spotifyEmbedUrl,
}: MusicPlayerProps) {
  const resolvedSpotifyEmbedUrl =
    spotifyEmbedUrl ?? process.env.NEXT_PUBLIC_SPOTIFY_EMBED_URL;
  const resolvedSrc = src ?? process.env.NEXT_PUBLIC_MUSIC_URL ?? "/audio/ambient.mp3";
  const resolvedTitle = title ?? process.env.NEXT_PUBLIC_MUSIC_TITLE ?? "Ambient";
  const isRemoteSource = /^https?:\/\//.test(resolvedSrc);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);

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

  if (resolvedSpotifyEmbedUrl) {
    const wrapperHeight = isOpen ? 352 : 80;

    return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Minimize music player" : "Expand music player"}
          aria-expanded={isOpen}
          className="flex items-center gap-3 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[#2B303A] shadow-lg backdrop-blur-md"
        >
          <span className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">Now Playing</span>
            <span className="text-xs font-semibold">{resolvedTitle}</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-70">
            {isOpen ? "Minimize" : "Expand"}
          </span>
        </button>
        <div
          className="overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-xl backdrop-blur-md transition-all duration-300"
          style={{ height: wrapperHeight }}
        >
          <iframe
            title="Spotify playlist"
            src={resolvedSpotifyEmbedUrl}
            width={320}
            height={352}
            style={{ border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[#2B303A] shadow-lg backdrop-blur-md">
      <audio
        ref={audioRef}
        src={resolvedSrc}
        loop
        preload="metadata"
        crossOrigin={isRemoteSource ? "anonymous" : undefined}
        onCanPlay={() => setIsReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        disabled={!isReady}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B303A] text-white transition-transform hover:scale-105 disabled:opacity-50"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-60">Now Playing</span>
        <span className="text-xs font-semibold">{resolvedTitle}</span>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <Volume2 className="h-4 w-4 opacity-60" />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          className="h-1 w-24 accent-[#2B303A]"
          aria-label="Music volume"
        />
      </div>
    </div>
  );
}
