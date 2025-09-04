import { useState, useRef, useEffect } from "react";
import { Message, sendChatMessage } from "@/lib/chat";
import { ensureValidTimestamp } from "@/lib/utils";

const initialMessage: Message = {
  id: "1",
  content: "Welcome to Marrickville Yoga Centre! How can I help you today?",
  sender: "bot",
  timestamp: new Date(),
  isNew: false,
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

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

  // Load messages from Redis on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            // Ensure all messages have valid timestamps and mark as not new
            const validatedMessages = data.messages.map((msg: any) => ({
              ...msg,
              timestamp: ensureValidTimestamp(msg.timestamp),
              isNew: false,
            }));

            // Limit to the most recent 20 messages
            const recentMessages = validatedMessages.slice(-20);

            // If there is prior history, add a welcome back message
            const welcomeBack: Message = {
              id: `${Date.now()}_welcome_back`,
              content: "Welcome back! How can I help you today?",
              sender: "bot",
              timestamp: new Date(),
              isNew: true,
            };
            setMessages([...recentMessages, welcomeBack]);
            // Ensure scroll happens after state update with immediate scroll for loading
            setTimeout(() => {
              scrollToBottomImmediate();
            }, 200);
            return;
          }
        }
        // If no history or error, keep the initial message
        setMessages([initialMessage]);
        // Ensure scroll to bottom for initial message too
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 100);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // Fallback to initial message on error
        setMessages([initialMessage]);
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 100);
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    // Add a small delay to ensure all content is rendered before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = async (content: string) => {
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

    try {
      const currentMessages = [...messages, userMessage];

      const data = await sendChatMessage(content, currentMessages, sessionId);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: "bot",
        timestamp: new Date(),
        isNew: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
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
