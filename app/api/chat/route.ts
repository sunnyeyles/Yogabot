import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    const faqPath = path.join(process.cwd(), "public", "bot-knowledge.md");
    const faqText = fs.readFileSync(faqPath, "utf8");

    // Create the system message with FAQ context
    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful yoga studio assistant. Use the following FAQ to answer the user's question.
FAQ:
${faqText}
`,
    };

    // Build the messages array with conversation history
    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    let reply =
      completion.choices[0].message?.content ?? "Sorry, I don't know.";

    // Clean up excessive line breaks and formatting
    reply = reply
      .replace(/\n{3,}/g, "\n\n") // Replace 3+ line breaks with 2
      .replace(/\s+$/gm, "") // Remove trailing whitespace from lines
      .trim(); // Remove leading/trailing whitespace

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { reply: "Oops! Something went wrong." },
      { status: 500 }
    );
  }
}
