import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20') || 20, 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0);

    const rows = await db
      .select()
      .from(observations)
      .where(eq(observations.userId, userId))
      .orderBy(desc(observations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('List observations error:', error);
    return NextResponse.json(
      { error: 'Failed to list observations' },
      { status: 500 }
    );
  }
}
