import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const faqPath = path.join(process.cwd(), "public", "faq.txt");
    const faqText = fs.readFileSync(faqPath, "utf8");

    const prompt = `
You are a helpful yoga studio assistant. Use the following FAQ to answer the user's question.

FAQ:
${faqText}

User question: ${message}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply =
      completion.choices[0].message?.content ?? "Sorry, I don't know.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { reply: "Oops! Something went wrong." },
      { status: 500 }
    );
  }
}
