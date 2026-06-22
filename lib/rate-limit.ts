/**
 * Distributed rate limiter.
 *
 * Uses Upstash Redis (sliding window) when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are configured — shared across all serverless
 * instances and durable across deploys. Falls back to a per-instance
 * in-memory sliding window when Upstash is not configured (local dev, or
 * before the Upstash resource is provisioned), so the app never breaks.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

// ── Upstash (distributed) ────────────────────────────────────────────
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

// One Ratelimit instance per (max, window) config — Upstash configures the
// limiter at construction, not per call, so we cache by config.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(maxRequests: number, windowMs: number): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;
  const cacheKey = `${maxRequests}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: "rl",
      analytics: false,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory fallback ───────────────────────────────────────────────
interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

function checkRateLimitInMemory(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Check if a request is within rate limits.
 * @param key - Unique identifier (userId, IP, etc.)
 * @param maxRequests - Max requests per window
 * @param windowMs - Window duration in milliseconds
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const limiter = getLimiter(maxRequests, windowMs);

  if (limiter) {
    try {
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        allowed: success,
        remaining,
        resetMs: Math.max(0, reset - Date.now()),
      };
    } catch {
      // Redis unreachable — fail open to the in-memory limiter rather than
      // blocking all traffic on a transient Upstash outage.
      return checkRateLimitInMemory(key, maxRequests, windowMs);
    }
  }

  return checkRateLimitInMemory(key, maxRequests, windowMs);
}
