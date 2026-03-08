import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getOptionalUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check env vars
  checks.DATABASE_URL = !!process.env.DATABASE_URL;
  checks.DATABASE_URL_preview = process.env.DATABASE_URL?.substring(0, 25) + '...';
  checks.BLOB_READ_WRITE_TOKEN = !!process.env.BLOB_READ_WRITE_TOKEN;
  checks.BLOB_TOKEN_preview = process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) + '...';

  // 2. Check userId
  const userId = await getOptionalUserId();
  checks.userId = userId;

  // 3. Test DB connection
  try {
    const { db } = await import('@/lib/db');
    const { observations } = await import('@/lib/db/schema');
    const { sql } = await import('drizzle-orm');
    const result = await db.select({ count: sql<number>`count(*)` }).from(observations);
    checks.dbConnection = 'OK';
    checks.observationCount = result[0]?.count ?? 0;
  } catch (err) {
    checks.dbConnection = 'FAILED';
    checks.dbError = err instanceof Error ? err.message : String(err);
  }

  // 4. Test blob upload
  try {
    const { put, del } = await import('@vercel/blob');
    const testBlob = await put('_test/ping.txt', 'test', {
      access: 'public',
      contentType: 'text/plain',
    });
    checks.blobUpload = 'OK';
    checks.blobUrl = testBlob.url;
    // Clean up test blob
    await del(testBlob.url);
    checks.blobDelete = 'OK';
  } catch (err) {
    checks.blobUpload = 'FAILED';
    checks.blobError = err instanceof Error ? err.message : String(err);
  }

  // 5. Would persistence run?
  checks.wouldPersist = !!(userId && process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN);

  return NextResponse.json(checks, { status: 200 });
}
