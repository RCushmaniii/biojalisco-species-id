/**
 * GBIF (Global Biodiversity Information Facility) API integration.
 *
 * After GPT-4o identifies a species, we query GBIF to enrich the result
 * with verified, authoritative data: taxonomy, IUCN status, distribution,
 * and vernacular names in multiple languages.
 *
 * All endpoints are free, public, and require no authentication.
 * Docs: https://techdocs.gbif.org/en/openapi/v1/species
 */

const GBIF_BASE = 'https://api.gbif.org/v1';

export interface GBIFSpeciesMatch {
  usageKey: number;
  scientificName: string;
  canonicalName: string;
  rank: string;
  status: string;
  confidence: number;
  matchType: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export interface GBIFEnrichment {
  /** Verified GBIF taxonomy */
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  } | null;
  /** IUCN Red List category (e.g. "LC", "VU", "EN") */
  iucnStatus: string | null;
  /** IUCN category full name */
  iucnCategory: string | null;
  /** Distribution localities from authoritative sources */
  distributions: string[];
  /** Whether it's native/introduced */
  establishmentMeans: string | null;
  /** Vernacular names by language */
  vernacularNames: { en: string | null; es: string | null };
  /** GBIF species page URL */
  gbifUrl: string | null;
  /** GBIF match confidence */
  matchConfidence: number;
  /** Source attribution */
  source: 'GBIF';
}

const IUCN_LABELS: Record<string, string> = {
  LC: 'Least Concern',
  NT: 'Near Threatened',
  VU: 'Vulnerable',
  EN: 'Endangered',
  CR: 'Critically Endangered',
  EW: 'Extinct in the Wild',
  EX: 'Extinct',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
  LEAST_CONCERN: 'Least Concern',
  NEAR_THREATENED: 'Near Threatened',
  VULNERABLE: 'Vulnerable',
  ENDANGERED: 'Endangered',
  CRITICALLY_ENDANGERED: 'Critically Endangered',
};

async function gbifFetch(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${GBIF_BASE}${path}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BioJalisco-SpeciesID/1.0 (info@cushlabs.ai)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Look up a scientific name in GBIF and return enrichment data.
 * This is called after GPT-4o identifies a species, to overlay
 * verified data on top of the AI-generated response.
 */
export async function enrichFromGBIF(scientificName: string): Promise<GBIFEnrichment | null> {
  // Step 1: Match the name to GBIF backbone taxonomy
  const matchData = await gbifFetch(
    `/species/match?name=${encodeURIComponent(scientificName)}&verbose=false`
  ) as GBIFSpeciesMatch | null;

  if (!matchData || matchData.matchType === 'NONE' || !matchData.usageKey) {
    return null;
  }

  const key = matchData.usageKey;

  // Step 2: Fetch IUCN status, distributions, and vernacular names in parallel
  const [iucnData, distData, vernData] = await Promise.all([
    gbifFetch(`/species/${key}/iucnRedListCategory`) as Promise<Record<string, unknown> | null>,
    gbifFetch(`/species/${key}/distributions`) as Promise<{ results?: Record<string, unknown>[] } | null>,
    gbifFetch(`/species/${key}/vernacularNames`) as Promise<{ results?: Record<string, unknown>[] } | null>,
  ]);

  // Parse IUCN status
  let iucnStatus: string | null = null;
  let iucnCategory: string | null = null;
  if (iucnData && iucnData.code) {
    iucnStatus = iucnData.code as string;
    iucnCategory = IUCN_LABELS[iucnStatus] || IUCN_LABELS[iucnData.category as string] || iucnStatus;
  }

  // Parse distributions
  const distributions: string[] = [];
  let establishmentMeans: string | null = null;
  if (distData?.results) {
    for (const d of distData.results) {
      if (d.locality && typeof d.locality === 'string') {
        distributions.push(d.locality);
      }
      if (d.establishmentMeans && !establishmentMeans) {
        establishmentMeans = (d.establishmentMeans as string).toLowerCase();
      }
    }
  }

  // Parse vernacular names (prefer first English and Spanish)
  let enName: string | null = null;
  let esName: string | null = null;
  if (vernData?.results) {
    for (const v of vernData.results) {
      const lang = v.language as string;
      const name = v.vernacularName as string;
      if (!enName && (lang === 'eng' || lang === 'en')) enName = name;
      if (!esName && (lang === 'spa' || lang === 'es')) esName = name;
      if (enName && esName) break;
    }
  }

  return {
    taxonomy: {
      kingdom: matchData.kingdom || 'Unknown',
      phylum: matchData.phylum || 'Unknown',
      class: matchData.class || 'Unknown',
      order: matchData.order || 'Unknown',
      family: matchData.family || 'Unknown',
      genus: matchData.genus || 'Unknown',
      species: matchData.species || matchData.canonicalName || scientificName,
    },
    iucnStatus,
    iucnCategory,
    distributions: [...new Set(distributions)].slice(0, 5), // deduplicate, limit to 5
    establishmentMeans,
    vernacularNames: { en: enName, es: esName },
    gbifUrl: `https://www.gbif.org/species/${key}`,
    matchConfidence: matchData.confidence,
    source: 'GBIF',
  };
}
