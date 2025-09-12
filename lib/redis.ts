import { createClient } from "redis";
import { ensureValidTimestamp } from "@/lib/utils";

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connection state
let isConnected = false;

// Connect to Redis
const connectRedis = async () => {
  try {
    await redis.connect();
    isConnected = true;
    console.log("Redis Client Connected");
  } catch (error) {
    console.error("Redis connection failed:", error);
    isConnected = false;
  }
};

// Initialize connection
connectRedis();

// Handle connection events
redis.on("error", (err) => {
  console.error("Redis Client Error", err);
  isConnected = false;
});

redis.on("connect", () => {
  console.log("Redis Client Connected");
  isConnected = true;
});

redis.on("ready", () => {
  console.log("Redis Client Ready");
  isConnected = true;
});

redis.on("end", () => {
  console.log("Redis Client Disconnected");
  isConnected = false;
});

redis.on("reconnecting", () => {
  console.log("Redis Client Reconnecting...");
});

export { redis };

// Connection status check
export const isRedisConnected = () => isConnected;

// Chat storage functions
export const storeChatMessage = async (
  ipAddress: string,
  message: {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
  }
) => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    // Validate message data
    if (
      !message.id ||
      !message.content ||
      !message.sender ||
      !message.timestamp
    ) {
      console.error("Invalid message data:", message);
      return false;
    }

    const chatKey = `chat:${ipAddress}`;
    const messageData = {
      ...message,
      timestamp: message.timestamp.toISOString(),
    };

    // Add message to the chat history for this IP
    await redis.lPush(chatKey, JSON.stringify(messageData));

    // Set expiration for chat history (e.g., 30 days)
    await redis.expire(chatKey, 30 * 24 * 60 * 60);

    return true;
  } catch (error) {
    console.error("Error storing chat message:", error);
    return false;
  }
};

export const getChatHistory = async (ipAddress: string) => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const chatKey = `chat:${ipAddress}`;
    const messages = await redis.lRange(chatKey, 0, -1);

    return messages
      .map((msg) => {
        try {
          const parsed = JSON.parse(msg);
          return {
            ...parsed,
            timestamp: ensureValidTimestamp(parsed.timestamp),
          };
        } catch (error) {
          console.error("Error parsing message from Redis:", error);
          // Return a fallback message if parsing fails
          return {
            id: `fallback_${Date.now()}`,
            content: "Message could not be loaded",
            sender: "bot" as const,
            timestamp: new Date(),
          };
        }
      })
      .reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return [];
  }
};

export const clearChatHistory = async (ipAddress: string) => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const chatKey = `chat:${ipAddress}`;
    await redis.del(chatKey);
    return true;
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return false;
  }
};

// Analytics data collection functions
export interface ChatAnalytics {
  id: string;
  timestamp: string;
  messageCount: number;
  sessionDuration?: number;
  quickActionsUsed: string[];
  conversation: Array<{
    role: "user" | "bot";
    content: string;
    timestamp: string;
  }>;
  ipHash: string; // Hashed IP for privacy
}

export const storeChatAnalytics = async (analytics: ChatAnalytics) => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const analyticsKey = `analytics:${analytics.id}`;
    await redis.set(analyticsKey, JSON.stringify(analytics));

    // Set expiration for analytics data (e.g., 1 year)
    await redis.expire(analyticsKey, 365 * 24 * 60 * 60);

    return true;
  } catch (error) {
    console.error("Error storing chat analytics:", error);
    return false;
  }
};

export const getChatAnalytics = async (limit: number = 100) => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const pattern = "analytics:*";
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      return [];
    }

    // Get the most recent analytics
    const recentKeys = keys.slice(-limit);
    const analytics = await redis.mGet(recentKeys);

    return analytics
      .filter((data) => data !== null)
      .map((data) => {
        try {
          return JSON.parse(data as string);
        } catch (error) {
          console.error("Error parsing analytics data:", error);
          return null;
        }
      })
      .filter((data) => data !== null);
  } catch (error) {
    console.error("Error retrieving chat analytics:", error);
    return [];
  }
};

// Rate limiting functions
export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetMs: number;
}

export const checkRateLimit = async (
  key: string,
  maxRequests: number = 15,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<RateLimitResult> => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const rateLimitKey = `rate_limit:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Use Redis pipeline for atomic operations
    const pipeline = redis.multi();

    // Remove expired entries (older than window)
    pipeline.zRemRangeByScore(rateLimitKey, 0, windowStart);

    // Count current requests in window
    pipeline.zCard(rateLimitKey);

    // Add current request
    pipeline.zAdd(rateLimitKey, {
      score: now,
      value: `${now}-${Math.random()}`,
    });

    // Set expiration for the key
    pipeline.expire(rateLimitKey, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();

    if (!results || results.length < 2) {
      throw new Error("Redis pipeline execution failed");
    }

    const currentCount = results[1] as unknown as number;
    const remaining = Math.max(0, maxRequests - currentCount - 1);
    const limited = currentCount >= maxRequests;

    return {
      limited,
      remaining,
      resetMs: windowMs,
    };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // On error, allow the request but log the issue
    return {
      limited: false,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }
};

export const getRateLimitInfo = async (
  key: string,
  windowMs: number = 60 * 60 * 1000
): Promise<{ count: number; resetMs: number }> => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const rateLimitKey = `rate_limit:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove expired entries and count remaining
    await redis.zRemRangeByScore(rateLimitKey, 0, windowStart);
    const count = await redis.zCard(rateLimitKey);
    const resetMs = windowMs;

    return { count, resetMs };
  } catch (error) {
    console.error("Error getting rate limit info:", error);
    return { count: 0, resetMs: windowMs };
  }
};

// OpenAI API rate limiting functions
export const checkOpenAIRateLimit = async (
  maxRequests: number = 150,
  windowMs: number = 300000 // 5 minutes
): Promise<RateLimitResult> => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const openAIRateLimitKey = "openai_rate_limit";
    const now = Date.now();
    const windowStart = now - windowMs;

    // Use Redis pipeline for atomic operations
    const pipeline = redis.multi();

    // Remove expired entries (older than window)
    pipeline.zRemRangeByScore(openAIRateLimitKey, 0, windowStart);

    // Count current requests in window
    pipeline.zCard(openAIRateLimitKey);

    // Add current request
    pipeline.zAdd(openAIRateLimitKey, {
      score: now,
      value: `${now}-${Math.random()}`,
    });

    // Set expiration for the key
    pipeline.expire(openAIRateLimitKey, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();

    if (!results || results.length < 2) {
      throw new Error("Redis pipeline execution failed");
    }

    const currentCount = results[1] as unknown as number;
    const remaining = Math.max(0, maxRequests - currentCount - 1);
    const limited = currentCount >= maxRequests;

    return {
      limited,
      remaining,
      resetMs: windowMs,
    };
  } catch (error) {
    console.error("Error checking OpenAI rate limit:", error);
    // On error, allow the request but log the issue
    return {
      limited: false,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }
};

export const getOpenAIRateLimitInfo = async (
  windowMs: number = 300000
): Promise<{ count: number; resetMs: number }> => {
  try {
    if (!isConnected) {
      console.warn("Redis not connected, attempting to reconnect...");
      await connectRedis();
    }

    const openAIRateLimitKey = "openai_rate_limit";
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove expired entries and count remaining
    await redis.zRemRangeByScore(openAIRateLimitKey, 0, windowStart);
    const count = await redis.zCard(openAIRateLimitKey);
    const resetMs = windowMs;

    return { count, resetMs };
  } catch (error) {
    console.error("Error getting OpenAI rate limit info:", error);
    return { count: 0, resetMs: windowMs };
  }
};
