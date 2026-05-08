"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginAdmin } from "@/app/actions/auth";
import Script from "next/script";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const turnstileToken = formData.get("cf-turnstile-response") as string;

    if (!turnstileToken) {
      setError("Please complete the CAPTCHA");
      setLoading(false);
      return;
    }

    const { success, error: signInError } = await loginAdmin(email, password, turnstileToken);

    if (!success) {
      setError(signInError || "Failed to login");
      setLoading(false);
      // Reset turnstile widget
      if (typeof window !== "undefined" && (window as any).turnstile) {
        (window as any).turnstile.reset();
      }
    } else {
      router.push("/admin/posts");
      router.refresh();
    }
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            disabled={loading}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground disabled:opacity-50 dark:border-white/10 dark:focus:border-white" 
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            disabled={loading}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground disabled:opacity-50 dark:border-white/10 dark:focus:border-white" 
          />
        </div>
        
        <div 
          className="cf-turnstile" 
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADLODmapPwvBJLiV"}
          data-theme="auto"
        ></div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </button>
      </form>
    </>
  );
}
