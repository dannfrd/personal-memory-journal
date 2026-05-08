import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simpan IP dan jumlah request di memory (Catatan: di Edge server/Vercel ini tidak ter-share antar instance)
// Untuk skala besar, disarankan menggunakan Redis (misal: @upstash/ratelimit)
const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  
  const limit = 100; // Maksimal request per window
  const windowMs = 60 * 1000; // 1 menit

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 1,
      lastReset: Date.now(),
    });
  } else {
    const ipData = rateLimitMap.get(ip);
    
    // Reset jika waktu window sudah lewat
    if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 1;
      ipData.lastReset = Date.now();
    } else {
      ipData.count += 1;
      
      // Jika melebihi limit, block request
      if (ipData.count > limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests - Terdeteksi aktivitas mencurigakan' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Tambahkan security headers ekstra ke response jika diperlukan
  const response = NextResponse.next();
  return response;
}

// Konfigurasi path mana saja yang ingin di-protect dengan middleware
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images dll di folder public)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
