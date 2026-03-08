import type { MetadataRoute } from 'next';

const BASE = 'https://biojalisco-species-id.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/observations`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/species-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Add dynamic observation pages if DB is available
  let observationPages: MetadataRoute.Sitemap = [];
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import('@/lib/db');
      const { observations } = await import('@/lib/db/schema');
      const { desc } = await import('drizzle-orm');

      const rows = await db
        .select({ id: observations.id, createdAt: observations.createdAt })
        .from(observations)
        .orderBy(desc(observations.createdAt))
        .limit(500);

      observationPages = rows.map((row) => ({
        url: `${BASE}/observations/${row.id}`,
        lastModified: row.createdAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch {
      // DB unavailable — skip dynamic pages
    }
  }

  return [...staticPages, ...observationPages];
}
