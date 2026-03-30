import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminPostsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  // Jika pengunjung tidak punya token sesi, tendang ke halaman login
  if (!token || token.value !== "authenticated") {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
