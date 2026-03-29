import { NextRequest, NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { getImageUrl } from '@/lib/blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Lightweight count-only mode for nav badge — returns 0 for non-reviewers
    if (searchParams.get('count') === 'true') {
      try {
        await requireReviewer();
      } catch {
        return NextResponse.json({ count: 0, isReviewer: false });
      }
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(observations)
        .where(eq(observations.status, 'pending'));
      return NextResponse.json({ count: result[0].count, isReviewer: true });
    }

    await requireReviewer();

    const rows = await db
      .select()
      .from(observations)
      .where(eq(observations.status, 'pending'))
      .orderBy(asc(observations.createdAt))
      .limit(50);

    const items = rows.map((r) => ({
      ...r,
      imageUrl: getImageUrl(r.imageUrl),
    }));

    return NextResponse.json(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    const clientMessage = status === 403 ? 'Forbidden' : status === 401 ? 'Unauthorized' : 'Failed to load review queue';
    console.error('Review list error:', message || error);
    return NextResponse.json({ error: clientMessage }, { status });
  }
}
