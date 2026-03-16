import { redirect } from 'next/navigation';
import { getAuthUserWithRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { getImageUrl } from '@/lib/blob';
import { ReviewQueue } from '@/components/review-queue';
import type { Observation } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  let userId: string;
  let isReviewer = false;

  try {
    const auth = await getAuthUserWithRole();
    userId = auth.userId;
    isReviewer = auth.isReviewer;
  } catch {
    redirect('/');
  }

  if (!isReviewer || !process.env.DATABASE_URL) {
    redirect('/dashboard');
  }

  const [pendingRows, countResult] = await Promise.all([
    db
      .select()
      .from(observations)
      .where(eq(observations.status, 'pending'))
      .orderBy(asc(observations.createdAt))
      .limit(50),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(observations)
      .where(eq(observations.status, 'pending')),
  ]);

  const pending: Observation[] = pendingRows.map((r) => ({
    ...r,
    imageUrl: getImageUrl(r.imageUrl),
    taxonomy: r.taxonomy as Observation['taxonomy'],
    ecology: r.ecology as Observation['ecology'],
    geography: r.geography as Observation['geography'],
    conservation: r.conservation as Observation['conservation'],
    similarSpecies: r.similarSpecies as Observation['similarSpecies'],
    imageOrientation: r.imageOrientation as Observation['imageOrientation'],
    locationInfo: r.locationInfo as Observation['locationInfo'],
    imageMetadata: r.imageMetadata as Observation['imageMetadata'],
    gpsSource: r.gpsSource as Observation['gpsSource'],
    elevation: r.elevation,
    environmentNotes: r.environmentNotes,
    status: r.status as Observation['status'],
    reviewerNotes: r.reviewerNotes,
    reviewedBy: r.reviewedBy,
    reviewedAt: r.reviewedAt,
    originalAiIdentification: r.originalAiIdentification as Observation['originalAiIdentification'],
    identifiedAt: r.identifiedAt,
    createdAt: r.createdAt,
  }));

  const totalPending = countResult[0].count;

  return (
    <>
      <div className="header">
        <h1>
          <span className="accent">Review</span> Queue
        </h1>
        <p>
          {totalPending} {totalPending === 1 ? 'observation' : 'observations'} awaiting review
        </p>
      </div>

      <ReviewQueue observations={pending} />
    </>
  );
}
