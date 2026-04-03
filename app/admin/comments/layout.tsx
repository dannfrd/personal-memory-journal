import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/src/lib/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminCommentsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!verifyAdminToken(token?.value)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
