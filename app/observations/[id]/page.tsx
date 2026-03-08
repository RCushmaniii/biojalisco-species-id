import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { NavBrand } from '@/components/nav-brand';
import { SiteFooter } from '@/components/site-footer';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeftIcon } from '@/components/icons';
import { ObservationDetail } from '@/components/observation-detail';
import { getImageUrl } from '@/lib/blob';
import type { Observation } from '@/lib/types';

export const dynamic = 'force-dynamic';

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
    identifiedAt: row.identifiedAt,
    createdAt: row.createdAt,
  };

  return (
    <>
      <div className="toolbar-toggles">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links">
          <Link href="/observations" className="nav-link">Observations</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/sign-in" className="nav-link">Sign In</Link>
        </div>
      </nav>

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
