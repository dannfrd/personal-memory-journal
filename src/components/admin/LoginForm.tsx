"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/app/actions/auth";

// Fallback sitekey resmi dari Cloudflare Turnstile untuk mode testing (Always Passes)
const DEFAULT_TEST_SITE_KEY = "1x00000000000000000000AA";

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode?: string) => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  retry?: "auto" | "never";
  "retry-interval"?: number;
  "refresh-expired"?: "auto" | "manual" | "never";
}

interface TurnstileInstance {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
    onTurnstileReady?: () => void;
  }
}

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<"loading" | "ready" | "error" | "expired">("loading");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  const cleanupWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore cleanup error
      }
      widgetIdRef.current = null;
    }
  }, []);

  const renderTurnstile = useCallback(() => {
    if (!containerRef.current || !window.turnstile) {
      return;
    }

    cleanupWidget();

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "auto",
        size: "normal",
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileStatus("ready");
          setError(null);
        },
        "error-callback": (errorCode) => {
          console.warn("[Turnstile] Error callback triggered:", errorCode);
          setTurnstileToken(null);
          setTurnstileStatus("error");
        },
        "expired-callback": () => {
          console.warn("[Turnstile] Token expired");
          setTurnstileToken(null);
          setTurnstileStatus("expired");
        },
      });

      widgetIdRef.current = widgetId;
      setTurnstileStatus("ready");
    } catch (err) {
      console.error("[Turnstile] Failed to render widget:", err);
      setTurnstileStatus("error");
    }
  }, [cleanupWidget, siteKey]);

  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;

    const initWidget = () => {
      renderTurnstile();
    };

    if (window.turnstile) {
      // Use microtask or timeout to avoid synchronous setState inside the effect body
      const timer = setTimeout(initWidget, 0);
      return () => {
        clearTimeout(timer);
        cleanupWidget();
      };
    } else {
      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (existingScript) {
        existingScript.addEventListener("load", initWidget);
        return () => {
          existingScript.removeEventListener("load", initWidget);
          cleanupWidget();
        };
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initWidget();
        };
        script.onerror = () => {
          setTurnstileStatus("error");
        };
        document.head.appendChild(script);
        scriptElement = script;

        return () => {
          cleanupWidget();
          if (scriptElement && scriptElement.parentNode) {
            // Keep script cached in head
          }
        };
      }
    }
  }, [renderTurnstile, cleanupWidget]);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileStatus("loading");
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileStatus("ready");
      } catch {
        renderTurnstile();
      }
    } else {
      renderTurnstile();
    }
  }, [renderTurnstile]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Silakan selesaikan verifikasi keamanan Cloudflare terlebih dahulu.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    try {
      const result = await loginAdmin(email, password, turnstileToken);

      if (!result.success) {
        setError(result.error || "Gagal masuk. Periksa kembali email dan password.");
        setLoading(false);
        resetTurnstile();
      } else {
        router.push("/admin/posts");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.");
      setLoading(false);
      resetTurnstile();
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-800 shadow-sm transition-all dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Email Admin
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            placeholder="admin@example.com"
            className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-all focus:border-foreground focus:bg-background focus:ring-2 focus:ring-foreground/10 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white dark:focus:bg-background dark:focus:ring-white/10"
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={loading}
              placeholder="••••••••"
              className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-all focus:border-foreground focus:bg-background focus:ring-2 focus:ring-foreground/10 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white dark:focus:bg-background dark:focus:ring-white/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground/50 transition-colors hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Turnstile Verification Container */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div
            ref={containerRef}
            className="min-h-[65px] flex items-center justify-center overflow-hidden rounded-lg"
          />

          {turnstileStatus === "error" && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <span>Gagal memuat verifikasi Cloudflare.</span>
              <button
                type="button"
                onClick={resetTurnstile}
                className="inline-flex items-center gap-1 font-medium underline hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" /> Coba lagi
              </button>
            </div>
          )}

          {turnstileStatus === "expired" && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <span>Verifikasi kedaluwarsa.</span>
              <button
                type="button"
                onClick={resetTurnstile}
                className="inline-flex items-center gap-1 font-medium underline hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Masuk ke Dashboard</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
