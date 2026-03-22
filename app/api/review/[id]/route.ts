import { NextRequest, NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reviewerId = await requireReviewer();
    const { id } = await params;
    const body = await request.json();

    const action = body.action as string;
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }

    if (action === 'reject' && !body.notes?.trim()) {
      return NextResponse.json({ error: 'Rejection requires reviewer notes' }, { status: 400 });
    }

    // Fetch current observation
    const rows = await db
      .select()
      .from(observations)
      .where(eq(observations.id, id))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const current = rows[0];

    // Prevent re-reviewing already processed observations
    if (current.status !== 'pending') {
      return NextResponse.json(
        { error: `Observation already ${current.status}` },
        { status: 409 }
      );
    }

    // Build update
    const updates: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewerNotes: body.notes?.trim() || null,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    };

    // If corrections provided, snapshot original AI data first
    if (body.corrections && action === 'approve') {
      const corrections = body.corrections as Record<string, unknown>;

      // Save original AI identification before overwriting
      if (!current.originalAiIdentification) {
        updates.originalAiIdentification = {
          commonName: current.commonName,
          nombreComun: current.nombreComun,
          scientificName: current.scientificName,
          breed: current.breed,
          taxonomy: current.taxonomy,
          conservation: current.conservation,
        };
      }

      // Apply corrections (validate types and length)
      const MAX_FIELD = 200;
      const strOrNull = (v: unknown) => (typeof v === 'string' ? v.slice(0, MAX_FIELD) : null);
      if (corrections.commonName !== undefined) updates.commonName = strOrNull(corrections.commonName);
      if (corrections.nombreComun !== undefined) updates.nombreComun = strOrNull(corrections.nombreComun);
      if (corrections.scientificName !== undefined) updates.scientificName = strOrNull(corrections.scientificName);
      if (corrections.breed !== undefined) updates.breed = strOrNull(corrections.breed);
    }

    const updated = await db
      .update(observations)
      .set(updates)
      .where(eq(observations.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    const clientMessage = status === 403 ? 'Forbidden' : status === 401 ? 'Unauthorized' : 'Review action failed';
    console.error('Review error:', message || error);
    return NextResponse.json({ error: clientMessage }, { status });
  }
}
