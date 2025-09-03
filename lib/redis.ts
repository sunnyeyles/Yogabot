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
