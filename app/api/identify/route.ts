import { NextRequest, NextResponse } from 'next/server';
import { identifySpecies } from '@/lib/openai';
import { getLocalSpecies, formatSpeciesContext } from '@/lib/inaturalist';
import { enrichFromGBIF } from '@/lib/gbif';
import { enrichFromEncicloVida } from '@/lib/enciclovida';
import { reverseGeocode } from '@/lib/nominatim';
import { randomUUID } from 'crypto';

// Extend function timeout (Hobby: max 60s, Pro: max 300s)
export const maxDuration = 60;

async function getOptionalUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    const body = await request.json();

    let imageData: string = body.image_data || '';
    if (!imageData) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip data URI prefix if present
    if (imageData.includes(',')) {
      imageData = imageData.split(',')[1];
    }

    // Validate file size (base64 is ~33% larger than raw bytes)
    // Max 20MB raw = ~27MB base64
    const MAX_BASE64_SIZE = 27 * 1024 * 1024;
    if (imageData.length > MAX_BASE64_SIZE) {
      return NextResponse.json(
        { error: 'Image too large. Maximum file size is 20MB.', suggestion: 'Try a smaller image or reduce the resolution.' },
        { status: 400 }
      );
    }

    const latitude: number | null = body.latitude ?? null;
    const longitude: number | null = body.longitude ?? null;

    // GPS provenance tracking
    const gpsSource: string | null = body.gps_source ?? null;

    // EXIF metadata from client-side extraction
    const dateTaken: string | null = body.date_taken ?? null;
    const cameraMake: string | null = body.camera_make ?? null;
    const cameraModel: string | null = body.camera_model ?? null;

    // Fetch regional species data from iNaturalist + reverse geocode in parallel
    let speciesContext = '';
    let locationInfo = null;

    if (latitude != null && longitude != null) {
      const [speciesResult, geocodeResult] = await Promise.allSettled([
        getLocalSpecies(latitude, longitude).then(species => {
          const ctx = formatSpeciesContext(species);
          if (species.length > 0) {
            console.log(`iNaturalist: found ${species.length} local species for ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
          return ctx;
        }),
        reverseGeocode(latitude, longitude),
      ]);

      if (speciesResult.status === 'fulfilled') {
        speciesContext = speciesResult.value;
      }
      if (geocodeResult.status === 'fulfilled' && geocodeResult.value) {
        locationInfo = geocodeResult.value;
        console.log(`Nominatim: resolved to ${locationInfo.displayName}`);
      }
    }

    // Build location name for GPT-4o (e.g. "San Sebastian del Oeste, Jalisco, Mexico")
    const locationName = locationInfo?.displayName || null;

    // Call GPT-4o for identification (with location + regional species context)
    const result = await identifySpecies(imageData, latitude, longitude, speciesContext, locationName);

    // Enrich with verified data from GBIF + EncicloVida (in parallel, best-effort)
    const isError = 'error' in result;
    let gbifData = null;
    let evData = null;
    if (!isError) {
      const sciName = result.identification.scientific_name;
      const [gbifResult, evResult] = await Promise.allSettled([
        enrichFromGBIF(sciName),
        enrichFromEncicloVida(sciName),
      ]);

      // Process GBIF
      if (gbifResult.status === 'fulfilled' && gbifResult.value) {
        const enrichment = gbifResult.value;
        gbifData = {
          taxonomy: enrichment.taxonomy,
          iucnStatus: enrichment.iucnStatus,
          iucnCategory: enrichment.iucnCategory,
          distributions: enrichment.distributions,
          establishmentMeans: enrichment.establishmentMeans,
          vernacularNames: enrichment.vernacularNames,
          gbifUrl: enrichment.gbifUrl,
          matchConfidence: enrichment.matchConfidence,
        };
        if (enrichment.taxonomy) {
          result.taxonomy = enrichment.taxonomy;
        }
        if (enrichment.iucnCategory) {
          result.conservation = { ...result.conservation, iucn_status: enrichment.iucnCategory };
        }
        console.log(`GBIF: enriched ${sciName} (confidence: ${enrichment.matchConfidence})`);
      } else if (gbifResult.status === 'rejected') {
        console.warn('GBIF enrichment failed (non-fatal):', gbifResult.reason);
      }

      // Process EncicloVida
      if (evResult.status === 'fulfilled' && evResult.value) {
        const ev = evResult.value;
        evData = {
          speciesId: ev.speciesId,
          commonNameEs: ev.commonNameEs,
          allCommonNames: ev.allCommonNames,
          distributionTypes: ev.distributionTypes,
          characteristics: ev.characteristics,
          nom059Status: ev.nom059Status,
          photoUrl: ev.photoUrl,
          wikipediaSummary: ev.wikipediaSummary,
          geodataSources: ev.geodataSources,
          enciclovidaUrl: ev.enciclovidaUrl,
        };
        // Use CONABIO's authoritative Spanish common name if available
        if (ev.commonNameEs) {
          result.identification.nombre_comun = ev.commonNameEs;
        }
        console.log(`EncicloVida: enriched ${sciName} (${ev.distributionTypes.join(', ')})`);
      } else if (evResult.status === 'rejected') {
        console.warn('EncicloVida enrichment failed (non-fatal):', evResult.reason);
      }
    }

    // If we have auth + DB + blob storage, persist the observation
    let id: string | null = null;
    let imageUrl: string | null = null;

    const hasDb = !!process.env.DATABASE_URL;
    const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (userId && hasDb && hasBlob) {
      try {
        const { uploadImage } = await import('@/lib/blob');
        const { db } = await import('@/lib/db');
        const { observations } = await import('@/lib/db/schema');

        const filename = `${userId}-${randomUUID()}`;
        const blob = await uploadImage(imageData, filename);
        imageUrl = blob.url;

        id = randomUUID();
        const confidenceVal = isError ? null : (typeof result.confidence === 'number' ? Math.round(result.confidence) : null);

        await db.insert(observations).values({
          id,
          userId,
          imageUrl: blob.url,
          imageBlobPathname: blob.pathname,
          latitude,
          longitude,
          commonName: isError ? null : result.identification.common_name,
          nombreComun: isError ? null : result.identification.nombre_comun,
          scientificName: isError ? null : result.identification.scientific_name,
          breed: isError ? null : result.identification.breed,
          confidence: confidenceVal,
          taxonomy: isError ? null : result.taxonomy,
          ecology: isError ? null : result.ecology,
          geography: isError ? null : result.geography,
          conservation: isError ? null : result.conservation,
          similarSpecies: isError ? null : result.similar_species,
          imageOrientation: isError ? null : (result.image_orientation || 'landscape'),
          description: isError ? null : result.description,
          descripcion: isError ? null : result.descripcion,
          funFact: isError ? null : result.fun_fact,
          error: isError ? result.error : null,
          suggestion: isError ? (result.suggestion ?? null) : null,
          locationInfo: locationInfo || null,
          imageMetadata: (dateTaken || cameraMake || cameraModel) ? {
            dateTaken,
            cameraMake,
            cameraModel,
          } : null,
          gpsSource,
        });
      } catch (persistError) {
        console.error('Persistence failed:', persistError instanceof Error ? persistError.message : persistError);
        // Reset id so client knows persistence failed
        id = null;
        imageUrl = null;
      }
    } else {
      console.warn(`Skipping persistence: userId=${!!userId}, DB=${hasDb}, Blob=${hasBlob}`);
    }

    // Return the result (+ enrichment data + location + metadata + observation ID if persisted)
    return NextResponse.json({
      ...result,
      ...(gbifData ? { gbif: gbifData } : {}),
      ...(evData ? { enciclovida: evData } : {}),
      ...(locationInfo ? { locationInfo } : {}),
      ...((dateTaken || cameraMake || cameraModel) ? {
        imageMetadata: { dateTaken, cameraMake, cameraModel },
      } : {}),
      ...(gpsSource ? { gpsSource } : {}),
      ...(id ? { id, imageUrl } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Identify error:', message, error);
    return NextResponse.json(
      {
        error: message,
        suggestion: 'Check server logs for details. Make sure OPENAI_API_KEY is configured.',
      },
      { status: 500 }
    );
  }
}
