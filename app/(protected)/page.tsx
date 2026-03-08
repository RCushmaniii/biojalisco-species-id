import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ObservationList } from '@/components/observation-list';
import { OnboardingSection } from '@/components/onboarding-section';
import { DashboardStats } from '@/components/dashboard-stats';
import { ContributionBanner } from '@/components/contribution-banner';
import { getImageUrl } from '@/lib/blob';
import Link from 'next/link';
import { CameraIcon } from '@/components/icons';
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

const NOTABLE_STATUSES = new Set([
  'near threatened', 'nt',
  'vulnerable', 'vu',
  'endangered', 'en',
  'critically endangered', 'cr',
  'extinct in the wild', 'ew',
]);

export default async function DashboardPage() {
  const userId = await getAuthUserId();

  // No auth or no DB — show full onboarding only
  if (!userId || !process.env.DATABASE_URL) {
    return <OnboardingSection />;
  }

  const rows = await db
    .select()
    .from(observations)
    .where(eq(observations.userId, userId))
    .orderBy(desc(observations.createdAt))
    .limit(50);

  // Resolve signed URLs for private blob images
  const obs: Observation[] = await Promise.all(
    rows.map(async (r) => {
      let resolvedImageUrl = r.imageUrl;
      try {
        if (r.imageUrl.includes('vercel-storage.com')) {
          resolvedImageUrl = await getImageUrl(r.imageUrl);
        }
      } catch {
        // Fall back to stored URL
      }
      return {
        ...r,
        imageUrl: resolvedImageUrl,
        taxonomy: r.taxonomy as Observation['taxonomy'],
        ecology: r.ecology as Observation['ecology'],
        geography: r.geography as Observation['geography'],
        conservation: r.conservation as Observation['conservation'],
        similarSpecies: r.similarSpecies as Observation['similarSpecies'],
        identifiedAt: r.identifiedAt,
        createdAt: r.createdAt,
      };
    })
  );

  // Compute stats
  const uniqueSpeciesSet = new Set(
    obs.filter((o) => o.scientificName).map((o) => o.scientificName)
  );
  const conservationNotable = obs.filter((o) => {
    const status = o.conservation?.iucn_status?.toLowerCase() ?? '';
    return NOTABLE_STATUSES.has(status);
  }).length;
  const latestSpecies = obs[0]?.commonName ?? obs[0]?.scientificName ?? null;

  return (
    <>
      <div className="header">
        <h1>
          <span className="accent">Your</span> Dashboard
        </h1>
      </div>

      <div className="dashboard-content">
        <DashboardStats
          totalObservations={obs.length}
          uniqueSpecies={uniqueSpeciesSet.size}
          conservationNotable={conservationNotable}
        />

        {obs.length > 0 ? (
          <>
            <ContributionBanner
              totalObservations={obs.length}
              latestSpecies={latestSpecies}
            />
            <ObservationList observations={obs} />
            <div className="dashboard-cta">
              <Link href="/identify" className="btn btn-primary hero-btn">
                <CameraIcon />
                Identify Another
              </Link>
            </div>
          </>
        ) : (
          <DashboardEmpty />
        )}
      </div>
    </>
  );
}

function DashboardEmpty() {
  return (
    <div className="dashboard-empty">
      <div className="dashboard-empty-card">
        <h2>Ready to Start</h2>
        <p>
          Your observation log is empty. Head out into the field, snap a photo
          of any vertebrate animal, and BioJalisco will identify it — verified
          against GBIF, iNaturalist, and CONABIO databases.
        </p>
        <Link href="/identify" className="btn btn-primary hero-btn">
          <CameraIcon />
          Make Your First Identification
        </Link>
      </div>
      <div className="dashboard-empty-tips">
        <h3>Tips for Best Results</h3>
        <ul>
          <li>Photograph the animal clearly — the closer and sharper, the better</li>
          <li>Include the full body when possible, not just a partial view</li>
          <li>Natural lighting works best — avoid heavy shadows or flash glare</li>
          <li>Enable location services for automatic geotagging</li>
        </ul>
      </div>
    </div>
  );
}
