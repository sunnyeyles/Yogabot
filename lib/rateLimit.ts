import type { NextRequest } from "next/server";

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetMs: number;
}

const RATE_LIMIT_MAX = 15; // messages per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function getClientKey(request: NextRequest, sessionId?: string): string {
  if (sessionId) return `session:${sessionId}`;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `ip:${ip}`;
}

export function checkRateLimit(
  request: NextRequest,
  sessionId?: string
): RateLimitResult {
  const key = getClientKey(request, sessionId);
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return {
      limited: false,
      remaining: RATE_LIMIT_MAX - 1,
      resetMs: RATE_LIMIT_WINDOW_MS,
    };
  }

  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
    rateLimitStore.set(key, entry);
    return {
      limited: false,
      remaining: RATE_LIMIT_MAX - 1,
      resetMs: RATE_LIMIT_WINDOW_MS,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const resetMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { limited: true, remaining: 0, resetMs };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  const resetMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
  return { limited: false, remaining: RATE_LIMIT_MAX - entry.count, resetMs };
}

export const rateLimitHeaders = (result: RateLimitResult) => ({
  "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
  "X-RateLimit-Remaining": result.remaining.toString(),
  "Retry-After": Math.ceil(result.resetMs / 1000).toString(),
});
