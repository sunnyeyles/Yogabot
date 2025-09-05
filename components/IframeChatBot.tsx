"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { quickActions, suggestedQuestions } from "@/lib/constants";
import { formatTimestamp } from "@/lib/utils";
import ClientOnly from "@/components/ClientOnly";
import ReactMarkdown from "react-markdown";

export default function IframeChatBot() {
  const { messages, isTyping, messagesEndRef, handleSendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue("");
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Fade in animation for iframe
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Toggle Button with Text */}
      {!isOpen && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none z-[10000] flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 order-2 sm:order-1">
            Got questions? Ask me!
          </span>
          <button
            onClick={toggleChatbot}
            className="w-15 h-15 rounded-full bg-indigo-600 text-white border-none cursor-pointer shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-indigo-700 order-1 sm:order-2"
          >
            <Bot className="w-6 h-6 animate-float" />
          </button>
        </div>
      )}

      {/* Chatbot Container */}
      <div
        className={`fixed z-[9999] rounded-xl shadow-2xl border border-gray-200 bg-white transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full pointer-events-none"
        } ${
          // Mobile responsive positioning and sizing
          "w-[95vw] h-[80vh] max-w-[95vw] max-h-[80vh] " +
          "left-1/2 transform -translate-x-1/2 bottom-5 " +
          "sm:w-[550px] sm:h-[650px] sm:max-w-[600px] sm:max-h-[750px] " +
          "sm:left-auto sm:right-0 sm:transform-none sm:-translate-x-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={toggleChatbot}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/10 text-black border-none cursor-pointer z-[10001] flex items-center justify-center transition-all duration-200 hover:bg-black/20"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Chatbot Content */}
        <div
          className={`h-full w-full transition-opacity duration-500 m-0 p-0 relative overflow-hidden ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <Card className="h-full w-full rounded-none border-0 shadow-none flex flex-col m-0 p-0">
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
                  <h1 className="font-semibold text-lg animate-fade-in">
                    Hasubot
                  </h1>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className={`max-w-[80%] rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto p-2"
                        : "bg-card text-card-foreground p-3"
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
                        <span className="text-sm leading-relaxed">
                          {question}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

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
                  placeholder="Ask me anything..."
                  className="flex-1 sm:placeholder:text-base placeholder:text-sm"
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
      </div>
    </>
  );
}
