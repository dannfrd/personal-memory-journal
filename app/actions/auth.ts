"use server";

import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createAdminToken,
  isAdminCredentialValid,
} from "@/src/lib/adminAuth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// Fallback secret key resmi dari Cloudflare Turnstile untuk mode testing (Always Passes)
const DEFAULT_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export async function loginAdmin(email: string, password: string, turnstileToken?: string) {
  if (!turnstileToken || !turnstileToken.trim()) {
    return { success: false, error: "Silakan selesaikan verifikasi Cloudflare terlebih dahulu." };
  }

  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const realIp = reqHeaders.get("x-real-ip");
  const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "").trim();

  // Cloudflare rejects localhost or private subnet IPs in remoteip parameter
  const isPrivateOrLocal =
    !rawIp ||
    rawIp === "127.0.0.1" ||
    rawIp === "::1" ||
    rawIp.startsWith("10.") ||
    rawIp.startsWith("192.168.") ||
    rawIp.startsWith("172.16.") ||
    rawIp.startsWith("172.17.") ||
    rawIp.startsWith("172.18.") ||
    rawIp.startsWith("172.19.") ||
    rawIp.startsWith("172.2") ||
    rawIp.startsWith("172.30.") ||
    rawIp.startsWith("172.31.");

  const secretKey = process.env.TURNSTILE_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", turnstileToken.trim());

    if (!isPrivateOrLocal) {
      formData.append("remoteip", rawIp);
    }

    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
    });

    if (!turnstileRes.ok) {
      console.error("[Auth] Turnstile verification HTTP error:", turnstileRes.status, turnstileRes.statusText);
      return { success: false, error: "Gagal terhubung ke server Cloudflare. Silakan coba lagi." };
    }

    const turnstileData = await turnstileRes.json();
    console.log("[Auth] Turnstile Verify Response:", turnstileData);

    if (!turnstileData.success) {
      const errorCodes: string[] = Array.isArray(turnstileData["error-codes"]) ? turnstileData["error-codes"] : [];
      console.error("[Auth] Turnstile verification failed. Error codes:", errorCodes);

      if (errorCodes.includes("timeout-or-duplicate")) {
        return { success: false, error: "Verifikasi keamanan telah kedaluwarsa. Silakan verifikasi ulang." };
      }
      if (errorCodes.includes("invalid-input-secret") || errorCodes.includes("missing-input-secret")) {
        return { success: false, error: "Konfigurasi Turnstile Secret Key di server tidak valid." };
      }
      if (errorCodes.includes("invalid-input-response")) {
        return { success: false, error: "Token verifikasi tidak valid. Silakan coba lagi." };
      }

      return { success: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
    }
  } catch (err) {
    console.error("[Auth] Turnstile verification exception:", err);
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
    });
    return { success: true };
  }

  return { success: false, error: "Email atau password salah." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
