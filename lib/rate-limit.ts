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
  // Support both the standard Upstash names and the KV_* names that Vercel's
  // Upstash marketplace integration injects (KV_REST_API_URL / KV_REST_API_TOKEN).
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
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
//
// Reached when Upstash is not configured, or is configured but unreachable.
// Worth being blunt about what it is: each serverless instance keeps its own
// Map, so the real limit is the configured one multiplied by however many
// instances are warm, and it resets on every deploy and cold start. It stops a
// naive loop from one client and nothing more.
//
// It is kept because silently allowing everything would be worse, and because
// blocking all traffic on a transient Upstash blip would be worse still. What
// is NOT acceptable is arriving here quietly — see the logging at both call
// sites below.

/** Warn once per instance rather than on every request. */
let warnedUnconfigured = false;
function warnUnconfiguredOnce() {
  if (warnedUnconfigured) return;
  warnedUnconfigured = true;
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[rate-limit] No Upstash credentials (UPSTASH_REDIS_REST_URL/TOKEN or " +
        "KV_REST_API_URL/TOKEN). Rate limiting is per-instance in-memory only, " +
        "which does NOT hold across serverless instances and resets on every " +
        "deploy. Connect Upstash via the Vercel marketplace.",
    );
  }
}

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
    } catch (err) {
      // Redis unreachable — fall back to the in-memory limiter rather than
      // blocking all traffic on a transient Upstash outage.
      //
      // The fallback is NOT equivalent protection. Each serverless instance
      // keeps its own Map, so the effective limit is multiplied by however many
      // instances are warm. It is a speed bump, not a limit.
      //
      // This used to be a bare `catch {}`. That meant a Redis outage, or a
      // rotated token, degraded the limiter to near-nothing with no log line
      // anywhere — indistinguishable from working correctly from the outside.
      // Loud on the way down is the whole point.
      console.error(
        "[rate-limit] Upstash unreachable — falling back to per-instance " +
          "in-memory limiting, which does NOT hold across instances:",
        err instanceof Error ? err.message : String(err),
      );
      return checkRateLimitInMemory(key, maxRequests, windowMs);
    }
  }

  warnUnconfiguredOnce();
  return checkRateLimitInMemory(key, maxRequests, windowMs);
}
