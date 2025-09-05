"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import ClientOnly from "@/components/ClientOnly";

const quickActions = [
  "What classes do you offer?",
  "What are your prices?",
  "Where are you located?",
  "Do you have beginner classes?",
];

const suggestedQuestions = [
  "What time are your morning classes?",
  "Do you offer private sessions?",
  "What should I bring to class?",
  "Do you have parking?",
];

export default function IframeChatBot() {
  const { messages, isTyping, messagesEndRef, handleSendMessage } = useChat();
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
      setInput("");
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  useEffect(() => {
    // Fade in animation for iframe
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`h-screen w-full transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Card className="h-full w-full rounded-none border-0 shadow-none flex flex-col">
        {/* Top fade overlay */}
        <div className="absolute top-14 left-0 right-0 h-16 bg-gradient-to-b from-card to-transparent pointer-events-none z-10" />

        {/* Header */}
        <div className="bg-primary text-primary-foreground p-3 rounded-t-lg">
          <h2 className="text-lg font-semibold text-center">
            Marrickville Yoga Centre
          </h2>
          <p className="text-sm text-center opacity-90">
            Ask me anything about our classes, pricing, or the studio!
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          {messages.length === 0 && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Welcome to Marrickville Yoga Centre!
                </h3>
                <p className="text-sm text-muted-foreground">
                  I&apos;m here to help you with information about our classes,
                  pricing, and studio.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Actions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-2 py-1"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggested Questions:</p>
                <div className="space-y-1">
                  {suggestedQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-2 rounded border border-border/50 hover:border-border"
                      onClick={() => handleQuickAction(question)}
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={`${message.id}-${message.timestamp.getTime()}`}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <ClientOnly>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </ClientOnly>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about our classes, pricing, or studio..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button type="submit" disabled={isTyping || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
