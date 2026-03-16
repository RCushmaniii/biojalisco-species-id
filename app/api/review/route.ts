import { NextRequest, NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { getImageUrl } from '@/lib/blob';

export async function GET(request: NextRequest) {
  try {
    await requireReviewer();
    const { searchParams } = new URL(request.url);

    // Lightweight count-only mode for nav badge
    if (searchParams.get('count') === 'true') {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(observations)
        .where(eq(observations.status, 'pending'));
      return NextResponse.json({ count: result[0].count });
    }

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
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
