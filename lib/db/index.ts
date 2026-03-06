import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

// Lazy initialization — only fails when actually used, not at import time
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    const instance = getDb();
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});
