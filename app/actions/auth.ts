"use server"

import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createAdminToken,
  isAdminCredentialValid,
} from "@/src/lib/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(email: string, password: string) {
  if (isAdminCredentialValid(email, password)) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, createAdminToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    })
    return { success: true }
  }
  return { success: false, error: "Email atau password salah" }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME)
  redirect("/admin/login")
}
