export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isNew?: boolean;
}

export interface ChatResponse {
  reply: string;
}

export const sendChatMessage = async (
  message: string,
  conversationHistory: Message[],
  sessionId?: string
): Promise<ChatResponse> => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message.trim(),
      conversationHistory: conversationHistory.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      sessionId: sessionId || "default",
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};
