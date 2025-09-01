import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { KnowledgeManager } from "@/lib/knowledge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgeManager = new KnowledgeManager();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    // Get relevant knowledge sections based on the user's query
    const relevantSections = knowledgeManager.getRelevantSections(message, 8);
    const knowledgeContent =
      relevantSections.length > 0
        ? relevantSections
            .map((section) => `## ${section.title}\n\n${section.content}`)
            .join("\n\n")
        : knowledgeManager.getAllContent();

    // Create the system message with relevant knowledge context
    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful yoga studio assistant. Use the following information to answer the user's question.

Relevant Information:
${knowledgeContent}

Please provide helpful, accurate responses based on this information. Keep your responses concise and well-formatted. Avoid excessive line breaks and use proper spacing.`,
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
