import { useState, useRef, useEffect } from "react";
import { Message, sendChatMessage } from "@/lib/chat";
import { ensureValidTimestamp } from "@/lib/utils";

const initialMessage: Message = {
  id: "1",
  content: "Welcome to Marrickville Yoga Centre! How can I help you today?",
  sender: "bot",
  timestamp: new Date(),
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from Redis on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            // Ensure all messages have valid timestamps
            const validatedMessages = data.messages.map((msg: any) => ({
              ...msg,
              timestamp: ensureValidTimestamp(msg.timestamp),
            }));

            // If there is prior history, add a welcome back message
            const welcomeBack: Message = {
              id: `${Date.now()}_welcome_back`,
              content: "Welcome back! How can I help you today?",
              sender: "bot",
              timestamp: new Date(),
            };
            setMessages([...validatedMessages, welcomeBack]);
            return;
          }
        }
        // If no history or error, keep the initial message
        setMessages([initialMessage]);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // Fallback to initial message on error
        setMessages([initialMessage]);
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const currentMessages = [...messages, userMessage];

      const data = await sendChatMessage(content, currentMessages, sessionId);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Oops! Something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date(),
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
