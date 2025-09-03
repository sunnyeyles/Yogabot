import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { KnowledgeManager } from "@/lib/knowledge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgeManager = new KnowledgeManager();

interface ConversationState {
  currentFlow?: string;
  userResponses: Record<string, string>;
  step: number;
}

const conversationStates = new Map<string, ConversationState>();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionId } = await request.json();

    const state = conversationStates.get(sessionId || "default") || {
      userResponses: {},
      step: 0,
    };

    const queryType = getQueryType(message);

    if (queryType === "class_selection") {
      if (state.step === 0) {
        state.currentFlow = "class_selection";
        state.step = 1;

        const systemMessage = {
          role: "system" as const,
          content: `You are a helpful yoga studio assistant helping a student find the right class. 

IMPORTANT: Ask only ONE question at a time. Do not provide recommendations yet.

Start with: "Hi! I'd love to help you find the perfect yoga class. Are you new to yoga, or do you have some prior experience?"

Wait for their response before asking the next question.`,
        };

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            systemMessage,
            ...conversationHistory,
            { role: "user" as const, content: message },
          ],
        });

        return NextResponse.json({
          reply:
            completion.choices[0].message?.content ?? "Sorry, I don't know.",
        });
      }

      if (state.currentFlow === "class_selection") {
        const response = await handleClassSelectionFlow(message, state);
        conversationStates.set(sessionId || "default", state);
        return NextResponse.json({ reply: response });
      }
    }

    const relevantSections = knowledgeManager.getRelevantSections(message, 8);
    const knowledgeContent =
      relevantSections.length > 0
        ? relevantSections
            .map((section) => `## ${section.title}\n\n${section.content}`)
            .join("\n\n")
        : knowledgeManager.getAllContent();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system" as const,
          content: `You are a helpful yoga studio assistant. Use the following information to answer the user's question.

Relevant Information:
${knowledgeContent}

IMPORTANT: When users ask about schedules, timetables, or booking classes, always direct them to our online PunchPass system at https://marrickvilleyoga.punchpass.com/calendar

Please provide helpful, accurate responses based on this information. Keep your responses concise and well-formatted.`,
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

function getQueryType(message: string): string {
  const messageLower = message.toLowerCase();

  const pricingKeywords = [
    "cost",
    "price",
    "how much",
    "pricing",
    "membership",
    "pass",
    "fee",
  ];
  if (pricingKeywords.some((keyword) => messageLower.includes(keyword))) {
    return "pricing";
  }

  const classKeywords = [
    "find",
    "help",
    "recommend",
    "which",
    "what",
    "start",
    "beginner",
    "new",
  ];
  const classSelectionPhrases = [
    "help me find",
    "looking for",
    "want to start",
    "recommend a class",
    "which class should",
    "what class is best",
  ];

  if (
    (messageLower.includes("class") &&
      classKeywords.some((keyword) => messageLower.includes(keyword))) ||
    classSelectionPhrases.some((phrase) => messageLower.includes(phrase))
  ) {
    return "class_selection";
  }

  return "general";
}

async function handleClassSelectionFlow(
  userMessage: string,
  state: ConversationState
): Promise<string> {
  const userResponse = userMessage.toLowerCase();

  if (state.step === 1) {
    if (
      userResponse.includes("new") ||
      userResponse.includes("beginner") ||
      userResponse.includes("no experience")
    ) {
      state.userResponses.experience = "beginner";
      state.step = 2;
      return "Do you have any injuries or health conditions we should consider?";
    } else if (
      userResponse.includes("experience") ||
      userResponse.includes("prior") ||
      userResponse.includes("yes")
    ) {
      state.userResponses.experience = "experienced";
      state.step = 2;
      return "What type of practice are you looking for - regular classes, therapy-focused, or something more advanced?";
    } else {
      return "I didn't quite catch that. Are you new to yoga, or do you have some prior experience?";
    }
  } else if (state.step === 2) {
    if (state.userResponses.experience === "beginner") {
      if (
        userResponse.includes("injury") ||
        userResponse.includes("health") ||
        userResponse.includes("condition") ||
        userResponse.includes("yes")
      ) {
        state.userResponses.health = "with_conditions";
        state.step = 3;
        return "Would you prefer one-on-one guidance or group classes?";
      } else {
        state.userResponses.health = "no_conditions";
        state.step = 3;
        return "Would you prefer one-on-one guidance or group classes?";
      }
    } else {
      if (
        userResponse.includes("therapy") ||
        userResponse.includes("therapeutic")
      ) {
        state.userResponses.practiceType = "therapy";
        state.step = 3;
        return "Are you looking for in-studio classes, online classes, or both?";
      } else if (
        userResponse.includes("advanced") ||
        userResponse.includes("regular")
      ) {
        state.userResponses.practiceType = "regular";
        state.step = 3;
        return "Are you looking for in-studio classes, online classes, or both?";
      } else {
        return "I didn't quite understand. What type of practice are you looking for - regular classes, therapy-focused, or something more advanced?";
      }
    }
  } else if (state.step === 3) {
    let recommendation = "";

    if (state.userResponses.experience === "beginner") {
      if (state.userResponses.health === "with_conditions") {
        if (userResponse.includes("one") || userResponse.includes("personal")) {
          recommendation = "Yoga Therapy – Personal (one-on-one sessions)";
        } else {
          recommendation = "Yoga Therapy – Group classes";
        }
      } else {
        recommendation = "Beginning Classes with our 2-Week Unlimited Pass";
      }
    } else {
      if (state.userResponses.practiceType === "therapy") {
        if (userResponse.includes("online")) {
          recommendation = "Online Yoga Therapy classes";
        } else {
          recommendation = "Yoga Therapy – Personal or Group classes";
        }
      } else {
        if (userResponse.includes("online")) {
          recommendation = "Online classes with Content Library access";
        } else {
          recommendation = "General or Experienced level classes";
        }
      }
    }

    state.step = 4;

    return `Perfect! Based on what you've told me, I think **${recommendation}** would be ideal for you. 

Would you like me to help you book this class? You can check our online class calendar and timetables to see available times.`;
  } else if (state.step === 4) {
    if (
      userResponse.includes("yes") ||
      userResponse.includes("book") ||
      userResponse.includes("sure") ||
      userResponse.includes("okay")
    ) {
      state.currentFlow = undefined;
      state.step = 0;
      state.userResponses = {};

      return `Great! You can book your class through our online PunchPass system:

**Book Online:** [https://marrickvilleyoga.punchpass.com/calendar](https://marrickvilleyoga.punchpass.com/calendar)

This will show you all available class times and allow you to reserve your spot. We recommend booking in advance to ensure availability.

If you need help with the booking process or have any questions, feel free to contact us at info@marrickvilleyoga.com.au`;
    } else {
      state.currentFlow = undefined;
      state.step = 0;
      state.userResponses = {};

      return `No problem! If you change your mind or have any other questions about our classes, feel free to ask. You can always book later through our online system or contact us directly.`;
    }
  }

  return "I'm not sure how to proceed. Let me start over - are you new to yoga, or do you have some prior experience?";
}
