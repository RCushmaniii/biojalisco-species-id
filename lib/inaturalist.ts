/**
 * iNaturalist public API integration.
 *
 * Uses the free, public observations API to fetch species known near
 * a GPS coordinate. This gives GPT-4o a "regional field guide" so it
 * can weight its visual identification toward locally-observed species.
 *
 * Docs: https://api.inaturalist.org/v1/docs/
 */

const INAT_BASE = 'https://api.inaturalist.org/v1';

/** Vertebrate iconic taxa IDs in iNaturalist */
const VERTEBRATE_TAXON_IDS = [
  40151,  // Mammalia
  3,      // Aves
  26036,  // Reptilia
  20978,  // Amphibia
];

export interface LocalSpecies {
  name: string;
  scientificName: string;
  count: number;
  rank: string;
}

/**
 * Fetch vertebrate species observed near a GPS coordinate from iNaturalist.
 * Returns a list of species names + observation counts, sorted by frequency.
 *
 * Uses the /observations/species_counts endpoint which is public and free.
 * We request a 50km radius and research-grade observations only.
 */
export async function getLocalSpecies(
  latitude: number,
  longitude: number,
): Promise<LocalSpecies[]> {
  const params = new URLSearchParams({
    lat: latitude.toFixed(4),
    lng: longitude.toFixed(4),
    radius: '15',                              // km — tight radius to surface local endemics over widespread species
    taxon_id: VERTEBRATE_TAXON_IDS.join(','),  // vertebrates only
    quality_grade: 'research',                 // verified observations
    per_page: '50',                            // top 50 species
    locale: 'en',
  });

  const url = `${INAT_BASE}/observations/species_counts?${params}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BioJalisco-SpeciesID/1.0 (info@cushlabs.ai)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`iNaturalist API returned ${res.status}`);
      return [];
    }

    const data = await res.json();

    return (data.results || []).map((r: Record<string, unknown>) => {
      const taxon = r.taxon as Record<string, unknown>;
      return {
        name: (taxon.preferred_common_name as string) || (taxon.name as string),
        scientificName: taxon.name as string,
        count: r.count as number,
        rank: taxon.rank as string,
      };
    });
  } catch (err) {
    // Non-fatal — if iNat is down or slow, we just skip the context
    console.warn('iNaturalist API error (non-fatal):', err);
    return [];
  }
}

/**
 * Format the local species list into a concise context string for GPT-4o.
 */
export function formatSpeciesContext(species: LocalSpecies[]): string {
  if (species.length === 0) return '';

  const lines = species
    .slice(0, 30) // keep it concise for the prompt
    .map((s) => `- ${s.name} (${s.scientificName}) — ${s.count} observations`);

  return [
    'SUPPLEMENTARY REFERENCE — species recently observed near this location (from iNaturalist, not exhaustive):',
    ...lines,
    '',
    'IMPORTANT: This list is supplementary context only — it is NOT a complete inventory. Many species in this region are not on this list.',
    'You MUST still identify ANY vertebrate animal in the photo (mammals, birds, reptiles, amphibians) whether or not it appears on this list.',
    'Use the list as a geographic hint: if a visually similar species from this list fits the photo, prefer it over a lookalike from another continent.',
  ].join('\n');
}
