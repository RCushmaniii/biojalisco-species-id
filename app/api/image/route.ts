import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  // Only allow our own blob store URLs
  if (!url.includes('.blob.vercel-storage.com/')) {
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

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
