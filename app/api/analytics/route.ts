import { NextRequest, NextResponse } from "next/server";
import { getChatAnalytics } from "@/lib/redis";

// Define types for analytics data
interface ChatAnalyticsItem {
  sessionId: string;
  isEphemeral: boolean;
  messageCount: number;
  sessionDuration: number;
  quickActionsUsed?: string[];
  userQuestions?: string[];
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const type = searchParams.get("type"); // "ephemeral", "persistent", or "all"

    // Get analytics data
    const analytics = await getChatAnalytics(limit);

    // Filter by type if specified
    let filteredAnalytics = analytics;
    if (type === "ephemeral") {
      filteredAnalytics = analytics.filter(
        (item: ChatAnalyticsItem) => item.isEphemeral === true
      );
    } else if (type === "persistent") {
      filteredAnalytics = analytics.filter(
        (item: ChatAnalyticsItem) => item.isEphemeral === false
      );
    }

    // Calculate summary statistics
    const summary = {
      totalSessions: filteredAnalytics.length,
      ephemeralSessions: analytics.filter(
        (item: ChatAnalyticsItem) => item.isEphemeral === true
      ).length,
      persistentSessions: analytics.filter(
        (item: ChatAnalyticsItem) => item.isEphemeral === false
      ).length,
      averageMessageCount:
        filteredAnalytics.reduce(
          (sum: number, item: ChatAnalyticsItem) =>
            sum + (item.messageCount || 0),
          0
        ) / filteredAnalytics.length || 0,
      averageSessionDuration:
        filteredAnalytics.reduce(
          (sum: number, item: ChatAnalyticsItem) =>
            sum + (item.sessionDuration || 0),
          0
        ) / filteredAnalytics.length || 0,
      mostUsedQuickActions: getMostUsedQuickActions(filteredAnalytics),
      commonQuestions: getCommonQuestions(filteredAnalytics),
    };

    return NextResponse.json({
      analytics: filteredAnalytics,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving analytics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics data" },
      { status: 500 }
    );
  }
}

// Helper function to get most used quick actions
function getMostUsedQuickActions(analytics: ChatAnalyticsItem[]): {
  [key: string]: number;
} {
  const actionCounts: { [key: string]: number } = {};

  analytics.forEach((item: ChatAnalyticsItem) => {
    if (item.quickActionsUsed && Array.isArray(item.quickActionsUsed)) {
      item.quickActionsUsed.forEach((action: string) => {
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });
    }
  });

  // Sort by count and return top 10
  return Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
}

// Helper function to get common questions
function getCommonQuestions(analytics: ChatAnalyticsItem[]): {
  [key: string]: number;
} {
  const questionCounts: { [key: string]: number } = {};

  analytics.forEach((item: ChatAnalyticsItem) => {
    if (item.userQuestions && Array.isArray(item.userQuestions)) {
      item.userQuestions.forEach((question: string) => {
        // Normalize question (lowercase, trim)
        const normalized = question.toLowerCase().trim();
        if (normalized.length > 3) {
          // Only count meaningful questions
          questionCounts[normalized] = (questionCounts[normalized] || 0) + 1;
        }
      });
    }
  });

  // Sort by count and return top 10
  return Object.entries(questionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
}
