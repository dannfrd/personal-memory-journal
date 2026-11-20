import { LoginForm } from "@/src/components/admin/LoginForm";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/src/lib/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Lock, ShieldCheck, Sparkles } from "lucide-react";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);

  if (verifyAdminToken(token?.value)) {
    redirect("/admin/posts");
  }

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F6F3EC] text-[#1F242D] selection:bg-[#1F242D] selection:text-[#F6F3EC]">
      {/* Left Editorial Brand Showcase (Hidden on small mobile, 7 cols on desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between overflow-hidden bg-[#15181E] p-14 text-[#F6F3EC]">
        {/* Subtle decorative radial glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-rose-600/10 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-white transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo-lovelog.png"
              alt="Lovelog"
              width={160}
              height={75}
              className="h-9 w-auto brightness-0 invert"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight leading-none">
                Lovelog
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/60 mt-0.5">
                Curator Studio
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kembali ke Galeri</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl my-auto">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Private Editorial Workspace</span>
          </div>
          <h2 className="font-serif text-5xl xl:text-6xl font-medium leading-[1.1] tracking-tight text-white">
            Ruang kurasi untuk menjaga setiap{" "}
            <span className="italic font-normal text-amber-200">
              cerita dan kenangan tetap abadi.
            </span>
          </h2>
          <p className="mt-6 text-base text-white/70 leading-relaxed">
            Kelola koleksi foto, sunting kisah perjalanan, pilih bingkai terbaik, dan moderasi refleksi pengunjung dari satu studio terpadu.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 pt-8 border-t border-white/10 text-xs text-white/70">
          <div className="flex items-start gap-3">
            <BookOpen className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Kurasi Multi-Bingkai</p>
              <p className="mt-0.5 text-white/55">
                Mendukung gaya Polaroid, Film Strip, Perangko, dan Minimalis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Proteksi Cloudflare Turnstile</p>
              <p className="mt-0.5 text-white/55">
                Akses studio dilindungi enkripsi token sesi &amp; verifikasi anti-bot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Card Column (5 cols on desktop) */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 relative">
        <Link
          href="/"
          className="lg:hidden absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#1F242D] shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-10 shadow-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F242D] text-[#F6F3EC] shadow-md">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-800">
                Curator Access
              </span>
              <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#1F242D]">
                Masuk ke Studio
              </h1>
              <p className="mt-1.5 text-xs text-[#1F242D]/60">
                Masukkan kredensial kurator untuk mengelola arsip Lovelog.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
