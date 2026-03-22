import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function isAllowedBlobUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    // Must be HTTPS and hostname must end with .blob.vercel-storage.com
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.blob.vercel-storage.com')
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Require authentication — no anonymous blob proxying
  try {
    await getAuthUserId();
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  if (!isAllowedBlobUrl(url)) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Validate response is actually an image
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 400 });
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err instanceof Error ? err.message : err);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
