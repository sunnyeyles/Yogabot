import {  NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// Admin endpoint to view all chat histories
export async function GET() {
  try {
    // Get all keys that match the chat pattern
    const keys = await redis.keys("chat:*");

    if (keys.length === 0) {
      return NextResponse.json({
        message: "No chat histories found",
        chats: [],
      });
    }

    // Get chat histories for all IPs
    const chatHistories = await Promise.all(
      keys.map(async (key) => {
        const ip = key.replace("chat:", "");
        const messages = await redis.lRange(key, 0, -1);

        return {
          ip,
          messageCount: messages.length,
          lastMessage:
            messages.length > 0
              ? JSON.parse(messages[messages.length - 1])
              : null,
          messages: messages.map((msg) => JSON.parse(msg)),
        };
      })
    );

    return NextResponse.json({
      totalChats: chatHistories.length,
      chats: chatHistories,
    });
  } catch (error) {
    console.error("Error retrieving chat histories:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat histories" },
      { status: 500 }
    );
  }
}

// Admin endpoint to clear all chat histories
export async function DELETE() {
  try {
    const keys = await redis.keys("chat:*");

    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json({
      message: `Cleared ${keys.length} chat histories`,
      clearedCount: keys.length,
    });
  } catch (error) {
    console.error("Error clearing chat histories:", error);
    return NextResponse.json(
      { error: "Failed to clear chat histories" },
      { status: 500 }
    );
  }
}
