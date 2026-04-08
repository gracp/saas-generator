/**
 * Simple in-memory rate limiter for API routes.
 * In production, replace with Redis-backed rate limiting (Upstash).
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rate-limit";
 *   const limited = rateLimit({ ip: "127.0.0.1", limit: 5, window: 60 });
 *   if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number; // seconds until reset
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

export function rateLimit({
  key,
  limit = 100,
  window = 60, // seconds
}: {
  key: string;
  limit?: number;
  window?: number;
}): RateLimitResult {
  const now = Date.now();
  const windowMs = window * 1000;
  const resetAt = now + windowMs;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { ok: false, remaining: 0, resetAt: entry.resetAt, retryAfter };
  }

  // Increment
  entry.count++;
  return {
    ok: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Preset rate limit configs per endpoint type
 */
export const RATE_LIMITS = {
  auth: { limit: 5, window: 60 }, // 5/min — auth endpoints
  generate: { limit: 10, window: 60 }, // 10/min — generation
  api: { limit: 100, window: 60 }, // 100/min — general API
  webhook: { limit: 50, window: 60 }, // 50/min — webhooks
} as const;
