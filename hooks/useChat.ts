import { useState, useRef, useEffect } from "react";
import { Message, sendChatMessage } from "@/lib/chat";

const initialMessage: Message = {
  id: "1",
  content: "Welcome to Marrickville Yoga Centre! How can I help you today?",
  sender: "bot",
  timestamp: new Date(),
};

const STORAGE_MESSAGES_KEY = "chat:messages";
const STORAGE_WELCOME_DATE_KEY = "chat:lastWelcomeDate";

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

  // Load messages from localStorage on mount and optionally append a welcome-back
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_MESSAGES_KEY)
          : null;
      if (raw) {
        const parsed: Array<
          Omit<Message, "timestamp"> & { timestamp: string }
        > = JSON.parse(raw);
        const restored: Message[] = parsed.map((m, idx) => ({
          ...m,
          // Ensure unique ids even if old ones clash
          id: m.id || `${Date.now()}_${idx}`,
          timestamp: new Date(m.timestamp),
        }));

        // If there is prior history, add a once-per-day "Welcome back" message
        if (restored.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          const lastWelcomed = localStorage.getItem(STORAGE_WELCOME_DATE_KEY);
          if (lastWelcomed !== today) {
            const welcomeBack: Message = {
              id: `${Date.now()}_welcome_back`,
              content:
                "Welcome back! I saved our previous conversation. How can I help you today?",
              sender: "bot",
              timestamp: new Date(),
            };
            setMessages([...restored, welcomeBack]);
            localStorage.setItem(STORAGE_WELCOME_DATE_KEY, today);
            return;
          }
        }

        setMessages(restored);
      }
    } catch {
      // Ignore parse/storage errors and fall back to default
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const serializable = messages.map((m) => ({
        ...m,
        timestamp:
          m.timestamp instanceof Date
            ? m.timestamp.toISOString()
            : new Date(m.timestamp).toISOString(),
      }));
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage errors
    }
  }, [messages]);

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
