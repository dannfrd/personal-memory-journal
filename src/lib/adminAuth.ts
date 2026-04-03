import { createHmac, pbkdf2Sync, timingSafeEqual } from "crypto";

const ADMIN_EMAIL = "lovelog@gmail.com";
const ADMIN_PASSWORD_SALT = "e2d439383be872db96c8f9cd992ab1e1";
const ADMIN_PASSWORD_ITERATIONS = 210_000;
const ADMIN_PASSWORD_HASH = "6f0b22f9c68a6683d41142d6b3711ea034e7c9b02a58890e9dbe8c8624b9a1bf";
const ADMIN_TOKEN_SECRET = "36e4b3a6f57425008b5663ca72bab9e9c6950b869c82f63153932416b0a673c9";

export const ADMIN_COOKIE_NAME = "admin_token";
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AdminTokenPayload = {
  email: string;
  exp: number;
};

function safeBufferEqual(left: Buffer, right: Buffer): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function signTokenPayload(payloadBase64: string): string {
  return createHmac("sha256", ADMIN_TOKEN_SECRET)
    .update(payloadBase64)
    .digest("base64url");
}

export function isAdminCredentialValid(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== ADMIN_EMAIL) {
    return false;
  }

  const computedHash = pbkdf2Sync(
    password,
    ADMIN_PASSWORD_SALT,
    ADMIN_PASSWORD_ITERATIONS,
    32,
    "sha256"
  );

  const expectedHash = Buffer.from(ADMIN_PASSWORD_HASH, "hex");
  return safeBufferEqual(computedHash, expectedHash);
}

export function createAdminToken(): string {
  const payload: AdminTokenPayload = {
    email: ADMIN_EMAIL,
    exp: Date.now() + ADMIN_COOKIE_MAX_AGE_SECONDS * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signTokenPayload(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return false;
  }

  const expectedSignature = signTokenPayload(payloadBase64);
  if (!safeBufferEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8")
    ) as Partial<AdminTokenPayload>;

    if (decodedPayload.email !== ADMIN_EMAIL) {
      return false;
    }

    if (typeof decodedPayload.exp !== "number") {
      return false;
    }

    return decodedPayload.exp > Date.now();
  } catch {
    return false;
  }
}
