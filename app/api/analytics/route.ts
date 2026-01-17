import { NextRequest, NextResponse } from "next/server";

// Define types for analytics data
interface ChatAnalyticsItem {
  id: string;
  messageCount: number;
  sessionDuration?: number;
  quickActionsUsed?: string[];
  conversation?: Array<{
    role: "user" | "bot";
    content: string;
    timestamp: string;
  }>;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters (ignored since storage is disabled)
    new URL(request.url);

    // Analytics storage disabled
    const filteredAnalytics: ChatAnalyticsItem[] = [];

    // Calculate summary statistics
    const summary = {
      totalSessions: filteredAnalytics.length,
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
      message: "Analytics storage disabled.",
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
    if (item.conversation && Array.isArray(item.conversation)) {
      item.conversation.forEach((message) => {
        if (message.role === "user") {
          // Normalize question (lowercase, trim)
          const normalized = message.content.toLowerCase().trim();
          if (normalized.length > 3) {
            // Only count meaningful questions
            questionCounts[normalized] = (questionCounts[normalized] || 0) + 1;
          }
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
