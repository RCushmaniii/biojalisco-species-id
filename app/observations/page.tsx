import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { PublicNav } from '@/components/public-nav';
import { SiteFooter } from '@/components/site-footer';
import { GalleryGrid } from '@/components/gallery-lightbox';
import type { GalleryItem } from '@/components/gallery-lightbox';
import { getImageUrl } from '@/lib/blob';
import type { Observation } from '@/lib/types';
import { BreadcrumbJsonLd } from '@/components/json-ld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community Observations',
  description: 'Browse species observations submitted by conservation biologists and citizen scientists across Jalisco, Mexico. Verified with AI and scientific databases.',
  alternates: { canonical: '/observations', languages: { 'en': '/observations', 'es': '/observations', 'x-default': '/observations' } },
  openGraph: {
    title: 'Community Observations — BioJalisco',
    description: 'Explore biodiversity observations from field researchers in Jalisco, Mexico. Each identification verified against GBIF, iNaturalist, and CONABIO.',
  },
};

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
        .where(eq(observations.status, 'approved'))
        .orderBy(sql`${observations.featured} DESC NULLS LAST`, desc(observations.createdAt))
        .limit(100);

      obs = rows.map((r) => ({
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
        identifiedAt: r.identifiedAt ? new Date(r.identifiedAt) : null,
        createdAt: new Date(r.createdAt),
      }));
    }
  } catch {
    dbAvailable = false;
  }

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://biojalisco-species-id.vercel.app' },
        { name: 'Observations', url: 'https://biojalisco-species-id.vercel.app/observations' },
      ]} />
      <PublicNav />

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
            nombreComun: o.nombreComun,
            scientificName: o.scientificName,
            confidence: o.confidence,
            iucnStatus: o.conservation?.iucn_status ?? null,
            imageOrientation: o.imageOrientation ?? null,
            featured: o.featured ?? false,
            latitude: o.latitude,
            longitude: o.longitude,
            description: o.description,
            descripcion: o.descripcion,
            createdAt: o.createdAt.toISOString(),
          }))} />
        )}
      </div>

      <SiteFooter />
    </>
  );
}
