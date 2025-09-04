import type { NextRequest } from "next/server";
import {
  checkRateLimit as redisCheckRateLimit,
  type RateLimitResult,
} from "@/lib/redis";

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "15");
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "3600000"
); // 1 hour

function getClientKey(request: NextRequest, sessionId?: string): string {
  if (sessionId) return `session:${sessionId}`;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `ip:${ip}`;
}

export async function checkRateLimit(
  request: NextRequest,
  sessionId?: string
): Promise<RateLimitResult> {
  const key = getClientKey(request, sessionId);
  return await redisCheckRateLimit(key, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
}

export const rateLimitHeaders = (result: RateLimitResult) => ({
  "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
  "X-RateLimit-Remaining": result.remaining.toString(),
  "Retry-After": Math.ceil(result.resetMs / 1000).toString(),
});
