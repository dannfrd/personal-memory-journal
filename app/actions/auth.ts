"use server"

import { cookies } from "next/headers"

export async function loginAdmin(password: string) {
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    return { success: true }
  }
  return { success: false, error: "Invalid password" }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token")
  return { success: true }
}
