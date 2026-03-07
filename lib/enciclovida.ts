/**
 * EncicloVida (CONABIO) API integration.
 *
 * Mexico's national species encyclopedia. Provides Mexico-specific data
 * that global databases (GBIF, iNaturalist) don't have:
 * - Endemic/native/exotic/invasive classification for Mexico
 * - NOM-059 protection status (Mexico's endangered species list)
 * - Common names in Spanish and indigenous languages
 * - Wikipedia summaries in Spanish
 * - CONABIO-verified photos
 * - SNIB specimen data and NaturaLista observation links
 *
 * API: https://api.enciclovida.mx/docs
 * Source: https://github.com/CONABIO/enciclovidaAPI
 * No authentication required.
 */

const EV_BASE = 'https://api.enciclovida.mx';

export interface EncicloVidaEnrichment {
  /** EncicloVida species ID */
  speciesId: number;
  /** Full scientific name with authority */
  scientificName: string;
  /** Primary Spanish common name (CONABIO authoritative) */
  commonNameEs: string | null;
  /** All common names (may include indigenous languages) */
  allCommonNames: string[];
  /** Distribution types: Endémica, Nativa, Exótica, Invasora */
  distributionTypes: string[];
  /** Conservation characteristics (IUCN in Spanish, NOM-059, habitat) */
  characteristics: string[];
  /** NOM-059 status (Mexico's own protection list) */
  nom059Status: string | null;
  /** Photo URL from NaturaLista/CONABIO */
  photoUrl: string | null;
  /** Wikipedia summary in Spanish */
  wikipediaSummary: string | null;
  /** Geodata availability (SNIB specimens, NaturaLista observations) */
  geodataSources: string[];
  /** Direct link to EncicloVida species page */
  enciclovidaUrl: string;
  /** Source attribution */
  source: 'EncicloVida/CONABIO';
}

async function evFetch(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${EV_BASE}${path}`, {
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
 * Search EncicloVida for a species by scientific name, then fetch full details.
 */
export async function enrichFromEncicloVida(
  scientificName: string,
): Promise<EncicloVidaEnrichment | null> {
  // Step 1: Search by scientific name
  const searchData = await evFetch(
    `/especies/busqueda/basica/${encodeURIComponent(scientificName)}`
  ) as { taxa?: Record<string, unknown>[]; x_total_entries?: number } | null;

  if (!searchData?.taxa?.length) {
    return null;
  }

  // Find the best match (exact species match preferred)
  const match = searchData.taxa.find(
    (t) => (t.NombreCompleto as string)?.toLowerCase() === scientificName.toLowerCase()
  ) || searchData.taxa[0];

  const speciesId = match.IdNombre as number;
  if (!speciesId) return null;

  // Step 2: Fetch full species detail + Wikipedia summary in parallel
  const [speciesData, wikiData] = await Promise.all([
    evFetch(`/especie/${speciesId}`) as Promise<Record<string, unknown> | null>,
    evFetch(`/especie/descripcion/${speciesId}/resumen-wikipedia`) as Promise<{
      estatus?: boolean;
      sumamry?: string; // note: typo in their API
    } | null>,
  ]);

  if (!speciesData) return null;

  // Parse distribution types (Endémica, Nativa, Exótica, Invasora)
  const distributionTypes: string[] = [];
  const distArr = speciesData.e_tipo_distribucion as { Descripcion: string }[] | undefined;
  if (distArr) {
    for (const d of distArr) {
      if (d.Descripcion) distributionTypes.push(d.Descripcion);
    }
  }

  // Parse characteristics (conservation, habitat, NOM-059)
  const characteristics: string[] = [];
  let nom059Status: string | null = null;
  const charArr = speciesData.e_caracteristicas as { Descripcion: string }[] | undefined;
  if (charArr) {
    for (const c of charArr) {
      if (c.Descripcion) {
        characteristics.push(c.Descripcion);
        // Detect NOM-059 entries
        const desc = c.Descripcion.toLowerCase();
        if (
          desc.includes('nom-059') ||
          desc.includes('peligro de extinción') ||
          desc.includes('amenazada') ||
          desc.includes('sujeta a protección especial')
        ) {
          nom059Status = c.Descripcion;
        }
      }
    }
  }

  // Parse common names
  const allCommonNames: string[] = [];
  const namesStr = speciesData.e_nombres_comunes as string | undefined;
  if (namesStr) {
    allCommonNames.push(...namesStr.split(',').map((n) => n.trim()).filter(Boolean));
  }

  // Parse geodata sources
  const geodataSources: string[] = [];
  const geodata = speciesData.e_geodata as { cuales?: string[] } | undefined;
  if (geodata?.cuales) {
    geodataSources.push(...geodata.cuales);
  }

  // Wikipedia summary
  let wikipediaSummary: string | null = null;
  if (wikiData?.estatus && wikiData.sumamry) {
    // Strip HTML tags for clean text
    wikipediaSummary = wikiData.sumamry.replace(/<[^>]*>/g, '').trim();
  }

  return {
    speciesId,
    scientificName: (speciesData.NombreCompleto as string) || scientificName,
    commonNameEs: (speciesData.e_nombre_comun_principal as string) || null,
    allCommonNames,
    distributionTypes,
    characteristics,
    nom059Status,
    photoUrl: (speciesData.e_foto_principal as string) || null,
    wikipediaSummary,
    geodataSources,
    enciclovidaUrl: `https://enciclovida.mx/especies/${speciesId}`,
    source: 'EncicloVida/CONABIO',
  };
}
