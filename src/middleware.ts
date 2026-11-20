import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bounded in-memory rate limit map to prevent unbounded RAM growth on 4 GB VPS (VPS-01, VPS-06)
const MAX_TRACKED_IPS = 2000;
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  const limit = 120; // Max requests per 1-minute window
  const windowMs = 60 * 1000;
  const now = Date.now();

  const ipData = rateLimitMap.get(ip);

  if (!ipData) {
    // Evict expired or oldest entries if map reaches capacity
    if (rateLimitMap.size >= MAX_TRACKED_IPS) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now - val.lastReset > windowMs) {
          rateLimitMap.delete(key);
        }
      }
      if (rateLimitMap.size >= MAX_TRACKED_IPS) {
        const oldestKey = rateLimitMap.keys().next().value;
        if (oldestKey) rateLimitMap.delete(oldestKey);
      }
    }
    rateLimitMap.set(ip, {
      count: 1,
      lastReset: now,
    });
  } else {
    if (now - ipData.lastReset > windowMs) {
      ipData.count = 1;
      ipData.lastReset = now;
    } else {
      ipData.count += 1;

      if (ipData.count > limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests - Terdeteksi aktivitas mencurigakan' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp3|ogg|m4a)$).*)',
  ],
};
