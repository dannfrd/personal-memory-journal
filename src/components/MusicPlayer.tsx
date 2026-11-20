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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface Track {
  src: string;
  title: string;
  artist?: string;
}

const DEFAULT_TRACKS: Track[] = [
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

interface AudioContextValue {
  tracks: Track[];
  currentIndex: number;
  currentTrack: Track;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  togglePlayback: () => void;
  selectTrack: (index: number) => void;
  handleNext: () => void;
  handlePrev: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Persistent Global Audio Provider mounted once in app/layout.tsx.
 * Keeps music playing seamlessly across all Next.js route transitions
 * and automatically starts track 1 ("kota ini tak sama tanpamu") on page load
 * or on the user's very first tap/click anywhere on the page.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.35);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userManuallyPausedRef = useRef(false);
  const hasStartedOnceRef = useRef(false);
  const shouldPlayOnTrackChangeRef = useRef(false);

  const tracks = DEFAULT_TRACKS;
  const safeIndex = Math.min(currentIndex, tracks.length - 1);
  const currentTrack = tracks[safeIndex] ?? tracks[0];

  const encodedSrc = currentTrack.src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  // Sync volume & mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      await audio.play();
      hasStartedOnceRef.current = true;
      setIsPlaying(true);
      return true;
    } catch {
      setIsPlaying(false);
      return false;
    }
  }, []);

  // Auto-start on initial load + fallback unlock on first user interaction anywhere on the page
  useEffect(() => {
    const tryInitialAutoplay = async () => {
      if (userManuallyPausedRef.current || hasStartedOnceRef.current) return;
      await attemptPlay();
    };

    tryInitialAutoplay();

    const unlockOnFirstInteraction = async () => {
      if (userManuallyPausedRef.current || hasStartedOnceRef.current) {
        cleanupListeners();
        return;
      }
      const ok = await attemptPlay();
      if (ok) {
        cleanupListeners();
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener("pointerdown", unlockOnFirstInteraction);
      window.removeEventListener("touchstart", unlockOnFirstInteraction);
      window.removeEventListener("keydown", unlockOnFirstInteraction);
      window.removeEventListener("click", unlockOnFirstInteraction);
    };

    window.addEventListener("pointerdown", unlockOnFirstInteraction, { passive: true });
    window.addEventListener("touchstart", unlockOnFirstInteraction, { passive: true });
    window.addEventListener("keydown", unlockOnFirstInteraction, { passive: true });
    window.addEventListener("click", unlockOnFirstInteraction, { passive: true });

    return cleanupListeners;
  }, [attemptPlay]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      userManuallyPausedRef.current = false;
      await attemptPlay();
    } else {
      userManuallyPausedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    }
  }, [attemptPlay]);

  const selectTrack = useCallback(
    (index: number) => {
      userManuallyPausedRef.current = false;
      shouldPlayOnTrackChangeRef.current = true;
      setCurrentIndex(index);
      if (index === safeIndex && audioRef.current?.paused) {
        attemptPlay();
      }
    },
    [safeIndex, attemptPlay]
  );

  const handleNext = useCallback(() => {
    userManuallyPausedRef.current = false;
    shouldPlayOnTrackChangeRef.current = true;
    setCurrentIndex((prev) => (prev >= tracks.length - 1 ? 0 : prev + 1));
  }, [tracks.length]);

  const handlePrev = useCallback(() => {
    userManuallyPausedRef.current = false;
    shouldPlayOnTrackChangeRef.current = true;
    setCurrentIndex((prev) => (prev <= 0 ? tracks.length - 1 : prev - 1));
  }, [tracks.length]);

  const setVolume = useCallback((vol: number) => {
    setIsMuted(false);
    setVolumeState(vol);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        tracks,
        currentIndex: safeIndex,
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        togglePlayback,
        selectTrack,
        handleNext,
        handlePrev,
        setVolume,
        toggleMute,
      }}
    >
      {/* Persistent Singleton HTML5 Audio Element — Never unmounts across pages */}
      <audio
        ref={audioRef}
        src={encodedSrc}
        autoPlay
        playsInline
        preload="metadata"
        onCanPlay={() => {
          if (
            shouldPlayOnTrackChangeRef.current ||
            (!userManuallyPausedRef.current && !hasStartedOnceRef.current)
          ) {
            shouldPlayOnTrackChangeRef.current = false;
            attemptPlay();
          }
        }}
        onPlay={() => {
          hasStartedOnceRef.current = true;
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          shouldPlayOnTrackChangeRef.current = true;
          setCurrentIndex((prev) => (prev >= tracks.length - 1 ? 0 : prev + 1));
        }}
      />
      {children}
    </AudioContext.Provider>
  );
}

/**
 * Sleek Navbar Control UI that consumes the persistent global AudioProvider.
 */
export function MusicPlayer() {
  const ctx = useContext(AudioContext);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (!ctx) return null;

  const {
    tracks,
    currentIndex,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    togglePlayback,
    selectTrack,
    handleNext,
    handlePrev,
    setVolume,
    toggleMute,
  } = ctx;

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Sleek Navbar Pill Control */}
      <div className="inline-flex items-center rounded-full border border-black/15 bg-white/90 p-1 shadow-xs backdrop-blur-md">
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
          {isPlaying ? (
            <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
              <span className="w-0.5 h-2.5 bg-amber-800 rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-amber-800 rounded-full animate-bounce" />
              <span className="w-0.5 h-2 bg-amber-800 rounded-full animate-pulse" />
            </span>
          ) : (
            <Music className="h-3.5 w-3.5 text-[#1F242D]/60" aria-hidden="true" />
          )}

          <span className="max-w-[100px] sm:max-w-[140px] truncate text-[11px] font-semibold text-[#1F242D]">
            {currentTrack?.title ?? "Soundtrack"}
          </span>
        </button>
      </div>

      {/* Dropdown Popover: Tracklist, Controls & Volume */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-72 sm:w-80 rounded-2xl border border-black/10 bg-[#FAF8F5] p-4 text-[#1F242D] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Current Track Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/10">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-900">
                {isPlaying ? "Now Playing" : "Paused"}
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
                aria-label="Lagu sebelumnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#1F242D] hover:bg-black/5"
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
                aria-label="Lagu berikutnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#1F242D] hover:bg-black/5"
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Playlist Selector */}
          <div className="py-2.5 border-b border-black/10 space-y-1">
            <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#1F242D]/50">
              Pilih Lagu ({tracks.length})
            </p>
            {tracks.map((track, idx) => {
              const active = idx === currentIndex;
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
                  {active && (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="pt-3 flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleMute}
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
              onChange={(event) =>
                setVolume(Number(event.target.value) / 100)
              }
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
