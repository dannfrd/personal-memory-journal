import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function AdminPostsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Jika pengunjung tidak punya sesi (belum login), tendang ke halaman login
  if (!user) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
