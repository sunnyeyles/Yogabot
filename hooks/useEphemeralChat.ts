import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/chat";

const initialMessage: Message = {
  id: "1",
  content: "Welcome to Marrickville Yoga Centre! How can I help you today?",
  sender: "bot",
  timestamp: new Date(),
  isNew: false,
};

export const useEphemeralChat = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(
    () => `ephemeral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [sessionStartTime] = useState(() => Date.now());
  const [quickActionsUsed, setQuickActionsUsed] = useState<string[]>([]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  const scrollToBottomImmediate = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "end",
        inline: "nearest",
      });
    }
  };

  // No loading of chat history for ephemeral chat
  useEffect(() => {
    // Just ensure scroll to bottom for initial message
    setTimeout(() => {
      scrollToBottomImmediate();
    }, 100);
  }, []);

  useEffect(() => {
    // Add a small delay to ensure all content is rendered before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = async (
    content: string,
    isQuickAction: boolean = false
  ) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
      isNew: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Track quick actions used
    if (isQuickAction) {
      setQuickActionsUsed((prev) => [...prev, content]);
    }

    try {
      const currentMessages = [...messages, userMessage];
      const sessionDuration = Date.now() - sessionStartTime;

      // Prepare analytics data
      const analyticsData = {
        messageCount: currentMessages.length,
        sessionDuration,
        userQuestions: currentMessages
          .filter((msg) => msg.sender === "user")
          .map((msg) => msg.content),
        botResponses: currentMessages
          .filter((msg) => msg.sender === "bot")
          .map((msg) => msg.content),
        quickActionsUsed,
      };

      // Use ephemeral API endpoint
      const response = await fetch("/api/chat/ephemeral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: currentMessages.slice(0, -1).map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          sessionId,
          analyticsData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: "bot",
        timestamp: new Date(),
        isNew: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Ephemeral chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Oops! Something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        isNew: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  return {
    messages,
    isTyping,
    messagesEndRef,
    handleSendMessage,
  };
};
