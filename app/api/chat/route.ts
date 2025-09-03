import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { KnowledgeManager } from "@/lib/knowledge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knowledgeManager = new KnowledgeManager();

// Simple conversation state tracking
interface ConversationState {
  currentFlow?: string;
  userResponses: Record<string, string>;
  step: number;
}

const conversationStates = new Map<string, ConversationState>();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionId } = await request.json();

    // Get or create conversation state
    const state = conversationStates.get(sessionId || "default") || {
      userResponses: {},
      step: 0,
    };

    // Check query type and handle accordingly
    const queryType = getQueryType(message);

    if (queryType === "pricing") {
      const response = await handlePricingQuery();
      return NextResponse.json({ reply: response });
    }

    if (queryType === "location") {
      const response = await handleLocationQuery();
      return NextResponse.json({ reply: response });
    }

    if (queryType === "class_selection" && state.step === 0) {
      // Start class selection flow
      const systemMessage = {
        role: "system" as const,
        content: `You are a helpful yoga studio assistant helping a student find the right class. 

IMPORTANT: Ask only ONE question at a time. Do not provide recommendations yet.

Start with: "Hi! I'd love to help you find the perfect yoga class. Are you new to yoga, or do you have some prior experience?"

Wait for their response before asking the next question.`,
      };
      state.currentFlow = "class_selection";
      state.step = 1;

      const messages = [
        systemMessage,
        ...conversationHistory,
        { role: "user" as const, content: message },
      ];

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
      });

      const reply =
        completion.choices[0].message?.content ?? "Sorry, I don't know.";
      return NextResponse.json({ reply });
    }

    if (state.currentFlow === "class_selection") {
      // Continue class selection flow
      const response = await handleClassSelectionFlow(
        message,
        state,
        conversationHistory
      );
      conversationStates.set(sessionId || "default", state);
      return NextResponse.json({ reply: response });
    }

    // Regular knowledge-based response
    const relevantSections = knowledgeManager.getRelevantSections(message, 8);
    const knowledgeContent =
      relevantSections.length > 0
        ? relevantSections
            .map((section) => `## ${section.title}\n\n${section.content}`)
            .join("\n\n")
        : knowledgeManager.getAllContent();

    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful yoga studio assistant. Use the following information to answer the user's question.

Relevant Information:
${knowledgeContent}

IMPORTANT: When users ask about schedules, timetables, or booking classes, always direct them to our online PunchPass system at https://marrickvilleyoga.punchpass.com/calendar

Please provide helpful, accurate responses based on this information. Keep your responses concise and well-formatted.`,
    };

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

    reply = reply
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

  if (
    messageLower.includes("cost") ||
    messageLower.includes("price") ||
    messageLower.includes("how much") ||
    messageLower.includes("pricing") ||
    messageLower.includes("membership") ||
    messageLower.includes("pass") ||
    messageLower.includes("fee")
  ) {
    return "pricing";
  }

  if (
    messageLower.includes("location") ||
    messageLower.includes("address") ||
    messageLower.includes("where") ||
    messageLower.includes("studio") ||
    messageLower.includes("directions")
  ) {
    return "location";
  }

  if (
    (messageLower.includes("class") &&
      (messageLower.includes("find") ||
        messageLower.includes("help") ||
        messageLower.includes("recommend") ||
        messageLower.includes("which") ||
        messageLower.includes("what") ||
        messageLower.includes("start") ||
        messageLower.includes("beginner") ||
        messageLower.includes("new"))) ||
    messageLower.includes("help me find") ||
    messageLower.includes("looking for") ||
    messageLower.includes("want to start") ||
    messageLower.includes("recommend a class") ||
    messageLower.includes("which class should") ||
    messageLower.includes("what class is best")
  ) {
    return "class_selection";
  }

  return "general";
}

async function handleClassSelectionFlow(
  userMessage: string,
  state: ConversationState,
  conversationHistory: any[]
): Promise<string> {
  const userResponse = userMessage.toLowerCase();

  if (state.step === 1) {
    // User answered experience level question
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
      // Handle beginner health considerations
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
      // Handle experienced user practice type
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
    // Final recommendation step
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

    // Move to booking step instead of resetting
    state.step = 4;

    return `Perfect! Based on what you've told me, I think **${recommendation}** would be ideal for you. 

Would you like me to help you book this class? You can check our online class calendar and timetables to see available times.`;
  } else if (state.step === 4) {
    // Handle booking response
    if (
      userResponse.includes("yes") ||
      userResponse.includes("book") ||
      userResponse.includes("sure") ||
      userResponse.includes("okay")
    ) {
      // Reset conversation state
      state.currentFlow = undefined;
      state.step = 0;
      state.userResponses = {};

      return `Great! You can book your class through our online PunchPass system:

**Book Online:** [https://marrickvilleyoga.punchpass.com/calendar](https://marrickvilleyoga.punchpass.com/calendar)

This will show you all available class times and allow you to reserve your spot. We recommend booking in advance to ensure availability.

If you need help with the booking process or have any questions, feel free to contact us at info@marrickvilleyoga.com.au`;
    } else {
      // Reset conversation state
      state.currentFlow = undefined;
      state.step = 0;
      state.userResponses = {};

      return `No problem! If you change your mind or have any other questions about our classes, feel free to ask. You can always book later through our online system or contact us directly.`;
    }
  }

  return "I'm not sure how to proceed. Let me start over - are you new to yoga, or do you have some prior experience?";
}

async function handlePricingQuery(): Promise<string> {
  // Get all pricing-related information from the knowledge base
  const pricingSections = knowledgeManager.getSectionByTag("pricing");
  const passSections = knowledgeManager.getSectionByTag("pass");
  const membershipSections = knowledgeManager.getSectionByTag("membership");

  // Combine all relevant sections
  const allPricingInfo = [
    ...pricingSections,
    ...passSections,
    ...membershipSections,
  ];

  if (allPricingInfo.length === 0) {
    return "I don't have current pricing information available. Please contact us at info@marrickvilleyoga.com.au for the most up-to-date pricing.";
  }

  // Create a comprehensive pricing response
  let response =
    "Here's a comprehensive overview of our passes and pricing:\n\n";

  // Group by type and format nicely
  const passTypes: Record<string, Array<{ title: string; content: string }>> = {
    "Beginner Options": [],
    "Regular Passes": [],
    Memberships: [],
    "Special Offers": [],
  };

  allPricingInfo.forEach((section) => {
    const title = section.title.toLowerCase();
    const content = section.content;

    if (title.includes("begin") || title.includes("single")) {
      passTypes["Beginner Options"].push({
        title: section.title,
        content: section.content,
      });
    } else if (title.includes("membership") || title.includes("weekly")) {
      passTypes["Memberships"].push({
        title: section.title,
        content: section.content,
      });
    } else if (title.includes("spring") || title.includes("special")) {
      passTypes["Special Offers"].push({
        title: section.title,
        content: section.content,
      });
    } else {
      passTypes["Regular Passes"].push({
        title: section.title,
        content: section.content,
      });
    }
  });

  // Format each section
  Object.entries(passTypes).forEach(([category, items]) => {
    if (items.length > 0) {
      response += `**${category}**\n`;
      items.forEach((item) => {
        response += `• ${item.title}: ${item.content}\n`;
      });
      response += "\n";
    }
  });

  response +=
    "**Book Online**: You can view our full schedule and book classes through our [PunchPass system](https://marrickvilleyoga.punchpass.com/calendar).\n\n";
  response +=
    "For any questions about passes or to discuss the best option for you, please contact us at info@marrickvilleyoga.com.au";

  return response;
}

async function handleLocationQuery(): Promise<string> {
  return `Here's our location information:

**Address:** Level 1 53 Sydenham Rd, Marrickville NSW, Australia 2204

**Nearby:**
• Marrickville and Sydenham train stations
• Public transport including the Sydenham metro line
• Ample free parking

For directions or to contact us, please email info@marrickvilleyoga.com.au`;
}
