import { NextResponse } from "next/server";

// Admin endpoint to view all chat histories
export async function GET() {
  try {
    return NextResponse.json({
      message: "Chat history storage disabled.",
      totalChats: 0,
      chats: [],
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
    return NextResponse.json({
      message: "Chat history storage disabled.",
      clearedCount: 0,
    });
  } catch (error) {
    console.error("Error clearing chat histories:", error);
    return NextResponse.json(
      { error: "Failed to clear chat histories" },
      { status: 500 }
    );
  }
}
