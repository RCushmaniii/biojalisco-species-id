export interface LocationInfo {
  city: string | null;
  municipality: string | null;
  state: string | null;
  country: string | null;
  displayName: string;
}

/**
 * Reverse geocode GPS coordinates using OpenStreetMap Nominatim.
 * Free, no API key required. Server-side only (respects Nominatim usage policy).
 * Returns a structured location with a human-readable display name.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<LocationInfo | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'BioJalisco-SpeciesID/1.1 (biojalisco-species-id.vercel.app)',
        'Accept-Language': 'en,es',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.address) return null;

    const addr = data.address;

    const city = addr.city || addr.town || addr.village || addr.hamlet || null;
    const municipality = addr.county || addr.municipality || null;
    const state = addr.state || null;
    const country = addr.country || null;

    // Build a concise display name: "City, State, Country" or best available
    const parts = [city, state, country].filter(Boolean);
    const displayName = parts.length > 0 ? parts.join(', ') : data.display_name || 'Unknown location';

    return { city, municipality, state, country, displayName };
  } catch {
    // Nominatim unavailable or timed out — non-fatal
    return null;
  }
}
