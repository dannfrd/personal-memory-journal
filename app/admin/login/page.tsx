import { LoginForm } from "@/src/components/admin/LoginForm";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/src/lib/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);

  if (verifyAdminToken(token?.value)) {
    redirect("/admin/posts");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F6F3EC] px-4 py-12 text-[#1F242D] selection:bg-[#1F242D] selection:text-[#F6F3EC]">
      {/* Subtle Top-Left Return Link */}
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-medium text-[#1F242D]/75 shadow-xs backdrop-blur-sm transition-all hover:border-black/20 hover:bg-white hover:text-[#1F242D]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Kembali ke Galeri</span>
      </Link>

      {/* Clean Focused Authentication Card */}
      <div className="w-full max-w-[400px]">
        <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-10 shadow-lg">
          <div className="mb-7 flex flex-col items-center text-center">
            <Image
              src="/logo-lovelog.png"
              alt="Lovelog"
              width={140}
              height={64}
              priority
              className="mb-4 h-10 w-auto object-contain"
            />
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1F242D]">
              Curator Studio
            </h1>
            <p className="mt-1 text-xs text-[#1F242D]/55">
              Masuk untuk mengelola jurnal &amp; galeri memori.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
