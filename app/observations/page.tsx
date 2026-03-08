import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { NavBrand } from '@/components/nav-brand';
import { SiteFooter } from '@/components/site-footer';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { GalleryGrid } from '@/components/gallery-lightbox';
import type { GalleryItem } from '@/components/gallery-lightbox';
import { getImageUrl } from '@/lib/blob';
import type { Observation } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ObservationsPage() {
  let obs: Observation[] = [];
  let dbAvailable = true;

  try {
    if (!process.env.DATABASE_URL) {
      dbAvailable = false;
    } else {
      const rows = await db
        .select()
        .from(observations)
        .orderBy(desc(observations.createdAt))
        .limit(100);

      obs = rows.map((r) => ({
        ...r,
        imageUrl: getImageUrl(r.imageUrl),
        taxonomy: r.taxonomy as Observation['taxonomy'],
        ecology: r.ecology as Observation['ecology'],
        geography: r.geography as Observation['geography'],
        conservation: r.conservation as Observation['conservation'],
        similarSpecies: r.similarSpecies as Observation['similarSpecies'],
        // Convert Date objects to ISO strings for client component serialization
        identifiedAt: r.identifiedAt ? new Date(r.identifiedAt) : null,
        createdAt: new Date(r.createdAt),
      }));
    }
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <div className="toolbar-toggles">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/observations" className="nav-link active">Observations</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/sign-in" className="nav-link">Sign In</Link>
        </div>
      </nav>

      <div className="observations-page">
        <div className="header">
          <h1>
            <span className="accent">Community</span> Observations
          </h1>
          {dbAvailable && (
            <p className="header-subtitle">
              {obs.length} {obs.length === 1 ? 'observation' : 'observations'} recorded
            </p>
          )}
        </div>

        {!dbAvailable ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-card">
              <h2>Coming Soon</h2>
              <p>
                The community observations feed is not yet available. Once the
                database is configured, all species identifications will appear
                here for the research community to browse.
              </p>
            </div>
          </div>
        ) : obs.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-card">
              <h2>No Observations Yet</h2>
              <p>
                No species have been identified yet. Once researchers begin
                submitting observations, they will appear here for the community
                to explore.
              </p>
            </div>
          </div>
        ) : (
          <GalleryGrid items={obs.map((o): GalleryItem => ({
            id: o.id,
            imageUrl: o.imageUrl,
            commonName: o.commonName,
            scientificName: o.scientificName,
            confidence: o.confidence,
            iucnStatus: o.conservation?.iucn_status ?? null,
            latitude: o.latitude,
            longitude: o.longitude,
            description: o.description,
            createdAt: o.createdAt.toISOString(),
          }))} />
        )}
      </div>

      <SiteFooter />
    </>
  );
}
