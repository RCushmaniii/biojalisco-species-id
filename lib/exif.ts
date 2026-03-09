import exifr from 'exifr';

export interface ExifMetadata {
  latitude: number | null;
  longitude: number | null;
  dateTaken: string | null;
  cameraMake: string | null;
  cameraModel: string | null;
}

/**
 * Extract GPS coordinates and camera metadata from a File's EXIF data.
 * Returns null values for any field that isn't present.
 * Works client-side — exifr reads the File object directly.
 */
export async function extractExif(file: File): Promise<ExifMetadata> {
  const empty: ExifMetadata = {
    latitude: null,
    longitude: null,
    dateTaken: null,
    cameraMake: null,
    cameraModel: null,
  };

  try {
    const data = await exifr.parse(file, {
      gps: true,
      pick: ['DateTimeOriginal', 'Make', 'Model', 'GPSLatitude', 'GPSLongitude'],
    });

    if (!data) return empty;

    return {
      latitude: typeof data.latitude === 'number' ? data.latitude : null,
      longitude: typeof data.longitude === 'number' ? data.longitude : null,
      dateTaken: data.DateTimeOriginal
        ? (data.DateTimeOriginal instanceof Date
            ? data.DateTimeOriginal.toISOString()
            : String(data.DateTimeOriginal))
        : null,
      cameraMake: data.Make ? String(data.Make).trim() : null,
      cameraModel: data.Model ? String(data.Model).trim() : null,
    };
  } catch {
    // EXIF extraction failed (e.g. PNG without EXIF, corrupted data)
    return empty;
  }
}

/**
 * Re-render an image through a canvas to strip all EXIF metadata (privacy).
 * Returns a clean base64 data URL with no embedded GPS or camera info.
 */
export function stripExif(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Failed to load image for EXIF stripping'));
    img.src = dataUrl;
  });
}
