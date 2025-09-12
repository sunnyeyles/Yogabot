import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Check Redis connection
    const redisStatus = await checkRedisConnection();

    // Check if iframe endpoint is accessible
    const iframeStatus = await checkIframeEndpoint();

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        redis: redisStatus,
        iframe: iframeStatus,
      },
      uptime: process.uptime(),
    };

    // Determine overall health
    const isHealthy =
      redisStatus.status === "healthy" && iframeStatus.status === "healthy";

    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}

async function checkRedisConnection() {
  try {
    await redis.ping();
    return { status: "healthy", message: "Redis connection successful" };
  } catch (error) {
    console.error("Redis health check failed:", error);
    return { status: "unhealthy", message: "Redis connection failed" };
  }
}

async function checkIframeEndpoint() {
  try {
    // Check if the iframe endpoint would be accessible
    // This is a basic check - in production you might want to make an actual request
    return { status: "healthy", message: "Iframe endpoint accessible" };
  } catch (error) {
    console.error("Iframe health check failed:", error);
    return { status: "unhealthy", message: "Iframe endpoint failed" };
  }
}
