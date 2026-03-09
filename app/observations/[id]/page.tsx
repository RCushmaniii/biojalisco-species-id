import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicNav } from '@/components/public-nav';
import { SiteFooter } from '@/components/site-footer';
import { ArrowLeftIcon } from '@/components/icons';
import { ObservationDetail } from '@/components/observation-detail';
import { getImageUrl } from '@/lib/blob';
import type { Observation } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!process.env.DATABASE_URL) {
    return { title: 'Observation' };
  }

  try {
    const rows = await db
      .select({
        commonName: observations.commonName,
        scientificName: observations.scientificName,
        description: observations.description,
        imageUrl: observations.imageUrl,
      })
      .from(observations)
      .where(eq(observations.id, id))
      .limit(1);

    if (rows.length === 0) {
      return { title: 'Observation Not Found' };
    }

    const row = rows[0];
    const title = row.commonName
      ? `${row.commonName}${row.scientificName ? ` (${row.scientificName})` : ''}`
      : 'Species Observation';
    const description = row.description
      || `Species observation identified by BioJalisco AI pipeline and verified against GBIF, iNaturalist, and CONABIO databases.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/observations/${id}`,
        languages: { 'en': `/observations/${id}`, 'es': `/observations/${id}`, 'x-default': `/observations/${id}` },
      },
      openGraph: {
        title: `${title} — BioJalisco`,
        description,
        images: row.imageUrl ? [{ url: getImageUrl(row.imageUrl), width: 1200, height: 630, alt: title }] : undefined,
      },
    };
  } catch {
    return { title: 'Observation' };
  }
}

export default async function PublicObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!process.env.DATABASE_URL) {
    notFound();
  }

  const rows = await db
    .select()
    .from(observations)
    .where(eq(observations.id, id))
    .limit(1);

  if (rows.length === 0) {
    notFound();
  }

  const row = rows[0];
  const observation: Observation = {
    ...row,
    imageUrl: getImageUrl(row.imageUrl),
    taxonomy: row.taxonomy as Observation['taxonomy'],
    ecology: row.ecology as Observation['ecology'],
    geography: row.geography as Observation['geography'],
    conservation: row.conservation as Observation['conservation'],
    similarSpecies: row.similarSpecies as Observation['similarSpecies'],
    imageOrientation: row.imageOrientation as Observation['imageOrientation'],
    locationInfo: row.locationInfo as Observation['locationInfo'],
    imageMetadata: row.imageMetadata as Observation['imageMetadata'],
    identifiedAt: row.identifiedAt,
    createdAt: row.createdAt,
  };

  return (
    <>
      <PublicNav />

      <div style={{ width: '100%', maxWidth: '520px', padding: '0 1.25rem' }}>
        <Link href="/observations" className="back-link">
          <ArrowLeftIcon className="icon icon-sm" />
          Back to Observations
        </Link>
      </div>
      <ObservationDetail observation={observation} />

      <SiteFooter />
    </>
  );
}
