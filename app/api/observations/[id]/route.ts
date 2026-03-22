import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, getAuthUserWithRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteImage } from '@/lib/blob';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId();

    const rows = await db
      .select()
      .from(observations)
      .where(and(eq(observations.id, id), eq(observations.userId, userId)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Get observation error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, isReviewer } = await getAuthUserWithRole();
    const body = await request.json();

    // Build update object from allowed fields
    const updates: Record<string, unknown> = {};
    // Only reviewers can set featured status
    if (typeof body.featured === 'boolean' && isReviewer) updates.featured = body.featured;
    if (body.imageOrientation === 'landscape' || body.imageOrientation === 'portrait') {
      updates.imageOrientation = body.imageOrientation;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const rows = await db
      .update(observations)
      .set(updates)
      .where(and(eq(observations.id, id), eq(observations.userId, userId)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Patch observation error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId();

    // Fetch the observation to get the blob URL
    const rows = await db
      .select()
      .from(observations)
      .where(and(eq(observations.id, id), eq(observations.userId, userId)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const observation = rows[0];

    // Delete from Vercel Blob
    if (observation.imageUrl) {
      try {
        await deleteImage(observation.imageUrl);
      } catch {
        // Log but don't fail if blob deletion fails
        console.error('Failed to delete blob:', observation.imageUrl);
      }
    }

    // Delete from DB
    await db
      .delete(observations)
      .where(and(eq(observations.id, id), eq(observations.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete observation error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
