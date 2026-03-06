import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ObservationList } from '@/components/observation-list';
import { ViewfinderIcon } from '@/components/icons';
import Link from 'next/link';
import type { Observation } from '@/lib/types';

async function getAuthUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const userId = await getAuthUserId();

  // Without auth or DB, show empty state
  if (!userId || !process.env.DATABASE_URL) {
    return (
      <div className="empty-state">
        <ViewfinderIcon className="icon icon-lg" />
        <h2>No observations yet</h2>
        <p>Photograph any living thing and let AI identify it</p>
        <Link href="/identify" className="btn btn-primary">
          Start Identifying
        </Link>
      </div>
    );
  }

  const rows = await db
    .select()
    .from(observations)
    .where(eq(observations.userId, userId))
    .orderBy(desc(observations.createdAt))
    .limit(50);

  const obs: Observation[] = rows.map((r) => ({
    ...r,
    taxonomy: r.taxonomy as Observation['taxonomy'],
    ecology: r.ecology as Observation['ecology'],
    geography: r.geography as Observation['geography'],
    conservation: r.conservation as Observation['conservation'],
    similarSpecies: r.similarSpecies as Observation['similarSpecies'],
    identifiedAt: r.identifiedAt,
    createdAt: r.createdAt,
  }));

  if (obs.length === 0) {
    return (
      <div className="empty-state">
        <ViewfinderIcon className="icon icon-lg" />
        <h2>No observations yet</h2>
        <p>Photograph any living thing and let AI identify it</p>
        <Link href="/identify" className="btn btn-primary">
          Start Identifying
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <h1>
          <span className="accent">Your</span> Observations
        </h1>
        <p>{obs.length} species identified</p>
      </div>
      <ObservationList observations={obs} />
    </>
  );
}
