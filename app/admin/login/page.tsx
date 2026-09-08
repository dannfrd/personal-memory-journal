import { LoginForm } from "@/src/components/admin/LoginForm";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/src/lib/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);

  if (verifyAdminToken(token?.value)) {
    redirect("/admin/posts");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-foreground selection:text-background sm:px-6 lg:px-8">
      {/* Back to Home button */}
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3.5 py-1.5 text-xs font-medium text-foreground/70 backdrop-blur-sm transition-all hover:border-black/20 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/30"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-background/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/[0.03] text-foreground shadow-inner dark:border-white/10 dark:bg-white/[0.05]">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Admin Login
            </h1>
            <p className="mt-1 text-xs text-foreground/60">
              Akses khusus kurasi galeri & memory journal.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
