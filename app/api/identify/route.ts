import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';
import { identifySpecies } from '@/lib/openai';
import { uploadImage } from '@/lib/blob';
import { db } from '@/lib/db';
import { observations } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
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

    // Upload to Vercel Blob (with sharp compression)
    const filename = `${userId}-${randomUUID()}`;
    const { url: imageUrl, pathname: imageBlobPathname } = await uploadImage(
      imageData,
      filename
    );

    // Call GPT-4o for identification
    const result = await identifySpecies(imageData);

    // Build observation record
    const isError = 'error' in result;
    const id = randomUUID();

    const record = {
      id,
      userId,
      imageUrl,
      imageBlobPathname,
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
    };

    await db.insert(observations).values(record);

    // Return the result + observation ID for navigation
    return NextResponse.json({ ...result, id, imageUrl });
  } catch (error) {
    console.error('Identify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
