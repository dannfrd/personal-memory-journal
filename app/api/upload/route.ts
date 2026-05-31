import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/src/lib/adminAuth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { basename } from 'path';

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

function inferMimeTypeFromName(fileName: string | undefined) {
  const name = (fileName || '').toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  return '';
}
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function getVpsApiBaseUrl() {
  const baseUrl = process.env.VPS_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error('VPS_API_BASE_URL is not set');
  }
  return baseUrl.replace(/\/+$/, '');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

export async function POST(request: Request) {
  // 1. Auth check — only logged-in admin can upload
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!verifyAdminToken(adminToken?.value)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Validate file type (fallback to extension if type is missing)
    const inferredType = inferMimeTypeFromName(file.name);
    const effectiveType = file.type && file.type !== 'application/octet-stream'
      ? file.type
      : inferredType;
    if (!effectiveType || !ALLOWED_TYPES.includes(effectiveType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG/JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 25 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Sanitize filename — strip directory traversal chars, keep only safe chars
    const safeName = basename(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '');
    if (!safeName) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename.' },
        { status: 400 }
      );
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${safeName}`;

    const vpsUploadUrl = `${getVpsApiBaseUrl()}/uploads`;
    const uploadToken = process.env.UPLOAD_API_TOKEN?.trim();
    const internalSecret = process.env.VPS_API_SECRET?.trim();
    
    let uploadRes: Response;
    try {
      uploadRes = await fetch(vpsUploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': effectiveType,
          'X-File-Name': filename,
          ...(uploadToken ? { 'X-Upload-Token': uploadToken } : {}),
          ...(internalSecret ? { 'X-Internal-Secret': internalSecret } : {}),
        },
        body: buffer,
        cache: 'no-store',
      });
    } catch (error) {
      const message = `Cannot reach VPS upload endpoint (${vpsUploadUrl}). ${getErrorMessage(error)}`;
      console.error('Error uploading file:', message);
      return NextResponse.json(
        { success: false, error: message },
        { status: 502 }
      );
    }

    const responseBody = await uploadRes.json().catch(() => ({} as { url?: string; error?: string }));
    if (!uploadRes.ok || !responseBody.url) {
      return NextResponse.json(
        {
          success: false,
          error: responseBody.error || 'Upload to VPS failed',
        },
        { status: uploadRes.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: responseBody.url
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error uploading file:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
