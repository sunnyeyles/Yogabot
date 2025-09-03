import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { KnowledgeManager } from "@/lib/knowledge";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgeManager = new KnowledgeManager();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionId } = await request.json();

    // Enforce rate limit per session (fallback to IP)
    const rl = checkRateLimit(request, sessionId);
    if (rl.limited) {
      return NextResponse.json(
        {
          reply:
            "Rate limit exceeded. Please try again later. You can send up to 15 messages per hour.",
        },
        {
          status: 429,
          headers: rateLimitHeaders(rl),
        }
      );
    }

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

IMPORTANT INSTRUCTIONS:
- When users ask about schedules, timetables, or booking classes, always direct them to our online PunchPass system at https://marrickvilleyoga.punchpass.com/calendar
- When users ask about location, address, or where the studio is, always provide the complete address: "Level 1 53 Sydenham Rd, Marrickville NSW, Australia 2204"
- When users ask about pricing or passes, provide comprehensive information from the knowledge base
- When users ask about classes or what's available, give detailed information about our offerings
- Always be helpful, accurate, and provide complete information based on what you know
- If you don't have specific information, direct users to contact us at info@marrickvilleyoga.com.au

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

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { reply: "Oops! Something went wrong." },
      { status: 500 }
    );
  }
}
