import { NextRequest, NextResponse } from 'next/server';
import { forwardGeocode } from '@/lib/nominatim';

/**
 * Forward geocode a place name to GPS coordinates.
 * Used by the capture area when photos lack EXIF GPS data.
 * Server-side only to comply with Nominatim's User-Agent policy.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  const results = await forwardGeocode(query.trim());
  return NextResponse.json(results);
}
