import { LoginForm } from "@/src/components/admin/LoginForm";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
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
