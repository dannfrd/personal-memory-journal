"use server"

import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createAdminToken,
  isAdminCredentialValid,
} from "@/src/lib/adminAuth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(email: string, password: string, turnstileToken?: string) {
  if (!turnstileToken) {
    return { success: false, error: "Tolong selesaikan CAPTCHA terlebih dahulu" };
  }

  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] ?? reqHeaders.get('x-real-ip') ?? '127.0.0.1';

  try {
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
    formData.append('response', turnstileToken);
    formData.append('remoteip', ip);

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const turnstileData = await turnstileRes.json();
    
    // Log hasil dari Cloudflare agar kita bisa lihat error aslinya di terminal VPS
    console.log("Turnstile Verify Response:", turnstileData);

    if (!turnstileData.success) {
      console.error("Turnstile failed. Error codes:", turnstileData['error-codes']);
      return { success: false, error: "Verifikasi CAPTCHA gagal. Silakan coba lagi." };
    }
  } catch (err) {
    console.error("Turnstile verification exception:", err);
    return { success: false, error: "Terjadi kesalahan sistem saat memverifikasi keamanan." };
  }

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
