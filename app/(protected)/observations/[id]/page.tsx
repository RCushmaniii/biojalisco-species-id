import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons';
import { ObservationDetail } from '@/components/observation-detail';
import type { Observation } from '@/lib/types';

export default async function ObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await db
    .select()
    .from(observations)
    .where(and(eq(observations.id, id), eq(observations.userId, userId)))
    .limit(1);

  if (rows.length === 0) {
    notFound();
  }

  const row = rows[0];
  const observation: Observation = {
    ...row,
    taxonomy: row.taxonomy as Observation['taxonomy'],
    ecology: row.ecology as Observation['ecology'],
    geography: row.geography as Observation['geography'],
    conservation: row.conservation as Observation['conservation'],
    similarSpecies: row.similarSpecies as Observation['similarSpecies'],
    identifiedAt: row.identifiedAt,
    createdAt: row.createdAt,
  };

  return (
    <>
      <div style={{ width: '100%', maxWidth: '520px', padding: '0 1.25rem' }}>
        <Link href="/" className="back-link">
          <ArrowLeftIcon className="icon icon-sm" />
          Back to Dashboard
        </Link>
      </div>
      <ObservationDetail observation={observation} />
    </>
  );
}
