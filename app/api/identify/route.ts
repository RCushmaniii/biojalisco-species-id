import { NextRequest, NextResponse } from 'next/server';
import { identifySpecies } from '@/lib/openai';
import { getLocalSpecies, formatSpeciesContext } from '@/lib/inaturalist';
import { randomUUID } from 'crypto';

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

    // If we have auth + DB + blob storage, persist the observation
    let id: string | null = null;
    let imageUrl: string | null = null;

    if (userId && process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { uploadImage } = await import('@/lib/blob');
        const { db } = await import('@/lib/db');
        const { observations } = await import('@/lib/db/schema');

        const filename = `${userId}-${randomUUID()}`;
        const blob = await uploadImage(imageData, filename);
        imageUrl = blob.url;

        const isError = 'error' in result;
        id = randomUUID();

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
          confidence: isError ? null : result.confidence,
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
      } catch (persistError) {
        console.error('Failed to persist observation (continuing):', persistError);
      }
    }

    // Return the result (+ observation ID if persisted)
    return NextResponse.json({ ...result, ...(id ? { id, imageUrl } : {}) });
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
