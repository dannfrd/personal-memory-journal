import { LoginForm } from "@/src/components/admin/LoginForm";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/src/lib/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);

  if (verifyAdminToken(token?.value)) {
    redirect("/admin/posts");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to Gallery
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Secure admin access for memory curating.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
