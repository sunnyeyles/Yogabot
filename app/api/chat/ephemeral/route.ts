import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { KnowledgeManager } from "@/lib/knowledge";
import {
  checkRateLimit,
  rateLimitHeaders,
  checkOpenAIRateLimit,
  openAIRateLimitHeaders,
} from "@/lib/rateLimit";
import { IMPORTANT_INSTRUCTIONS } from "@/lib/constants";
import { sanitizeIP, hashIP } from "@/lib/utils";
import { storeChatAnalytics, ChatAnalytics } from "@/lib/redis";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgeManager = new KnowledgeManager();

// Helper function to get client IP address
const getClientIP = (request: NextRequest): string => {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  let clientIP = "unknown";

  if (forwarded) {
    clientIP = forwarded.split(",")[0].trim();
  } else if (realIP) {
    clientIP = realIP;
  } else if (cfConnectingIP) {
    clientIP = cfConnectingIP;
  }

  // Sanitize and validate the IP address
  return sanitizeIP(clientIP);
};

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionId, analyticsData } =
      await request.json();
    const clientIP = getClientIP(request);

    // Enforce rate limit per session (fallback to IP)
    const rl = await checkRateLimit(request, sessionId);
    if (rl.limited) {
      return NextResponse.json(
        {
          reply:
            "Rate limit exceeded. Please try again later. You can send up to 150 messages per 5 minutes.",
        },
        {
          status: 429,
          headers: rateLimitHeaders(rl),
        }
      );
    }

    // Check OpenAI API rate limit before making the call
    const openAIRateLimit = await checkOpenAIRateLimit();
    if (openAIRateLimit.limited) {
      return NextResponse.json(
        {
          reply:
            "Service temporarily unavailable due to high demand. Please try again in a few minutes.",
        },
        {
          status: 503,
          headers: openAIRateLimitHeaders(openAIRateLimit),
        }
      );
    }

    // NOTE: No message storage in Redis for ephemeral chat
    // Messages are only kept in memory during the session

    // Get all available knowledge to let the AI handle the logic
    const knowledgeContent = knowledgeManager.getAllContent();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system" as const,
          content: `You are a helpful yoga studio assistant for Marrickville Yoga Centre. Use the following information to answer the user's question.

Complete Knowledge Base:
${knowledgeContent}
${IMPORTANT_INSTRUCTIONS}
Please provide helpful, accurate responses based on this information. Keep your responses concise but comprehensive.`,
        },
        ...conversationHistory,
        { role: "user" as const, content: message },
      ],
    });

    const reply = (
      completion.choices[0].message?.content ?? "Sorry, I don't know."
    )
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s+$/gm, "")
      .trim();

    // NOTE: No bot message storage in Redis for ephemeral chat
    // But we do collect analytics data for business insights

    // Store analytics data if provided
    if (analyticsData) {
      try {
        const hashedIP = await hashIP(clientIP);
        const analytics: ChatAnalytics = {
          id: `${sessionId}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          messageCount: analyticsData.messageCount || 1,
          sessionDuration: analyticsData.sessionDuration,
          userQuestions: analyticsData.userQuestions || [message],
          botResponses: analyticsData.botResponses || [reply],
          quickActionsUsed: analyticsData.quickActionsUsed || [],
          isEphemeral: true,
          ipHash: hashedIP,
        };
        await storeChatAnalytics(analytics);
      } catch (error) {
        console.error("Error storing ephemeral analytics:", error);
        // Don't fail the request if analytics storage fails
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { reply: "Oops! Something went wrong." },
      { status: 500 }
    );
  }
}

// No GET endpoint for ephemeral chat - no history is stored
