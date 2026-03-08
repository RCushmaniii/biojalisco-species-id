import { NextRequest, NextResponse } from 'next/server';
import { identifySpecies } from '@/lib/openai';
import { getLocalSpecies, formatSpeciesContext } from '@/lib/inaturalist';
import { enrichFromGBIF } from '@/lib/gbif';
import { enrichFromEncicloVida } from '@/lib/enciclovida';
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

    const latitude: number | null = body.latitude ?? null;
    const longitude: number | null = body.longitude ?? null;

    // Fetch regional species data from iNaturalist (non-blocking, best-effort)
    let speciesContext = '';
    if (latitude != null && longitude != null) {
      const localSpecies = await getLocalSpecies(latitude, longitude);
      speciesContext = formatSpeciesContext(localSpecies);
      if (localSpecies.length > 0) {
        console.log(`iNaturalist: found ${localSpecies.length} local species for ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      }
    }

    // Call GPT-4o for identification (with location + regional species context)
    const result = await identifySpecies(imageData, latitude, longitude, speciesContext);

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
    console.log(`Persistence check: userId=${!!userId}, DATABASE_URL=${hasDb}, BLOB_READ_WRITE_TOKEN=${hasBlob}`);

    if (userId && hasDb && hasBlob) {
      try {
        const { uploadImage } = await import('@/lib/blob');
        const { db } = await import('@/lib/db');
        const { observations } = await import('@/lib/db/schema');

        const filename = `${userId}-${randomUUID()}`;
        console.log('Uploading image to blob storage...');
        const blob = await uploadImage(imageData, filename);
        imageUrl = blob.url;
        console.log(`Blob upload success: ${blob.pathname}`);

        id = randomUUID();

        const confidenceVal = isError ? null : (typeof result.confidence === 'number' ? Math.round(result.confidence) : null);

        console.log('Inserting observation into database...');
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
          description: isError ? null : result.description,
          descripcion: isError ? null : result.descripcion,
          funFact: isError ? null : result.fun_fact,
          error: isError ? result.error : null,
          suggestion: isError ? (result.suggestion ?? null) : null,
        });
        console.log(`Observation persisted: ${id}`);
      } catch (persistError) {
        console.error('PERSISTENCE FAILED:', persistError instanceof Error ? persistError.message : persistError);
        console.error('Full error:', persistError);
        // Reset id so client knows persistence failed
        id = null;
        imageUrl = null;
      }
    } else {
      console.warn(`Skipping persistence: userId=${!!userId}, DB=${hasDb}, Blob=${hasBlob}`);
    }

    // Return the result (+ enrichment data + observation ID if persisted)
    return NextResponse.json({
      ...result,
      ...(gbifData ? { gbif: gbifData } : {}),
      ...(evData ? { enciclovida: evData } : {}),
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
