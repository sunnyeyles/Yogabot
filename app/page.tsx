"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Calendar,
  Clock,
  Heart,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const quickActions = [
  { label: "Class Schedule", icon: Calendar },
  { label: "Beginner Classes", icon: Heart },
  { label: "Pricing", icon: Sparkles },
  { label: "Studio Location", icon: Clock },
];

export default function YogaChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome! Need help with yoga classes or studio details?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim() }),
      });

      const data = await res.json();

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

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-lg">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Yogabot</h1>
              {/* <p className="text-primary-foreground/80 text-sm">
                Your wellness companion
              </p> */}
            </div>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "bot" && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-card text-card-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card text-card-foreground rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Badge
                  key={action.label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {action.label}
                </Badge>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about classes, schedules, or anything else..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
