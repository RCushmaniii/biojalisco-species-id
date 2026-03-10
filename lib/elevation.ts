/**
 * Fetch elevation (meters above sea level) for GPS coordinates.
 * Uses Open-Meteo's free elevation API — no API key required.
 */
export async function getElevation(
  latitude: number,
  longitude: number,
): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const elevation = data.elevation?.[0];

    return typeof elevation === 'number' ? Math.round(elevation) : null;
  } catch {
    // Non-fatal — elevation is supplementary context
    return null;
  }
}
