"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { quickActions, suggestedQuestions } from "@/lib/constants";
import { formatTimestamp } from "@/lib/utils";
import ClientOnly from "@/components/ClientOnly";
import ReactMarkdown from "react-markdown";

export default function ChatBot() {
  const { messages, isTyping, messagesEndRef, handleSendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <Card
      className={`w-full max-w-2xl h-[600px] flex flex-col shadow-lg border-2 relative ${
        inputValue.trim() ? "paused" : ""
      }`}
    >
      {/* Top fade overlay */}
      <div
        className="absolute top-26
       left-0 right-0 h-16 bg-gradient-to-b from-card to-transparent pointer-events-none z-10"
      />
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg animate-slide-in-from-top">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center animate-pulse-slow ${
              inputValue.trim() ? "paused" : ""
            }`}
          >
            <Bot
              className={`w-5 h-5 animate-float ${
                inputValue.trim() ? "paused" : ""
              }`}
            />
          </div>
          <div>
            <h1 className="font-semibold text-lg animate-fade-in">Hasubot</h1>
            {/* <p className="text-primary-foreground/80 text-sm">
              Some other text here maybe
            </p> */}
          </div>
        </div>
      </div>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={`${message.id}-${message.timestamp.getTime()}`}
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
              <div className="text-sm leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 last:mb-0 list-disc list-inside">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 last:mb-0 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80 transition-colors"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <p className="text-xs opacity-70 mt-1">
                <ClientOnly fallback="--:--">
                  {formatTimestamp(message.timestamp)}
                </ClientOnly>
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

        {/* Example Questions - Show only when there's just the welcome message */}
        {messages.length === 1 && !isTyping && (
          <div className="flex justify-end">
            <div className="flex flex-col gap-2 max-w-[80%] items-end">
              {suggestedQuestions.map((question, index) => (
                <div
                  key={index}
                  className="rounded-xl py-1 px-4 border-1 border-primary/40 text-primary cursor-pointer hover:text-white hover:bg-primary/90 transition-colors"
                  onClick={() => handleSendMessage(question)}
                >
                  <span className="text-sm leading-relaxed">{question}</span>
                </div>
              ))}
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
  );
}
