import type { NextRequest } from "next/server";
import {
  checkRateLimit as redisCheckRateLimit,
  checkOpenAIRateLimit as redisCheckOpenAIRateLimit,
  type RateLimitResult,
} from "@/lib/redis";

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "150");
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "300000"
); // 5 minutes

const OPENAI_RATE_LIMIT_MAX = parseInt(
  process.env.OPENAI_RATE_LIMIT_MAX_REQUESTS || "150"
);
const OPENAI_RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.OPENAI_RATE_LIMIT_WINDOW_MS || "300000"
); // 5 minutes

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

export async function checkOpenAIRateLimit(): Promise<RateLimitResult> {
  return await redisCheckOpenAIRateLimit(
    OPENAI_RATE_LIMIT_MAX,
    OPENAI_RATE_LIMIT_WINDOW_MS
  );
}

export const rateLimitHeaders = (result: RateLimitResult) => ({
  "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
  "X-RateLimit-Remaining": result.remaining.toString(),
  "Retry-After": Math.ceil(result.resetMs / 1000).toString(),
});

export const openAIRateLimitHeaders = (result: RateLimitResult) => ({
  "X-OpenAI-RateLimit-Limit": OPENAI_RATE_LIMIT_MAX.toString(),
  "X-OpenAI-RateLimit-Remaining": result.remaining.toString(),
  "Retry-After": Math.ceil(result.resetMs / 1000).toString(),
});
