import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export const dynamic = 'force-dynamic';

async function getOptionalUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = await getOptionalUserId();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  // Only allow our own blob store URLs
  if (!url.includes('.blob.vercel-storage.com/')) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  try {
    const blob = await get(url);
    if (!blob) {
      return new NextResponse('Not found', { status: 404 });
    }

    const body = await blob.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': blob.contentType || 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
