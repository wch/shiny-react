import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, Send, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function ChatInterface() {
  const [currentMessage, setCurrentMessage] = useShinyInput<string>(
    "chat_input",
    "",
    { debounceMs: 0, priority: "event" }
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle streaming messages
  useEffect(() => {
    const handleStreamingMessage = (msg: { chunk: string; done: boolean }) => {
      if (msg.done) {
        setIsLoading(false);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage?.role === "assistant") {
            // Append chunk to existing assistant message
            lastMessage.content += msg.chunk;
          } else {
            // Create new assistant message if none exists
            const newMessage = {
              id: Date.now().toString(),
              role: "assistant" as const,
              content: msg.chunk,
              timestamp: new Date(),
            };
            newMessages.push(newMessage);
          }

          return newMessages;
        });
      }
    };

    // Register the custom message handler for streaming
    const registerHandler = () => {
      if (window.Shiny && window.Shiny.addCustomMessageHandler) {
        window.Shiny.addCustomMessageHandler(
          "chat_stream",
          handleStreamingMessage
        );
      } else {
        setTimeout(registerHandler, 100);
      }
    };

    registerHandler();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message and placeholder assistant message together
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    // Add both messages in a single state update
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsLoading(true);

    // Send message to Shiny server
    setCurrentMessage(inputValue.trim());

    // Clear input
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className='chat-container'>
      <Card className='h-full flex flex-col'>
        <CardHeader className='flex-shrink-0'>
          <CardTitle className='flex items-center gap-2'>
            <Bot className='h-6 w-6' />
            AI Chat - Shiny React
          </CardTitle>
        </CardHeader>

        <CardContent className='flex-1 flex flex-col p-0'>
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className='flex-1 p-4'>
            <div className='space-y-4'>
              {messages.length === 0 && (
                <div className='flex items-center justify-center h-32 text-muted-foreground'>
                  <div className='text-center'>
                    <Bot className='h-8 w-8 mx-auto mb-2' />
                    <p>Start a conversation with the AI assistant</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 max-w-[80%]",
                    message.role === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto"
                  )}
                >
                  <Avatar className='h-8 w-8 flex-shrink-0'>
                    <AvatarFallback
                      className={cn(
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className='h-4 w-4' />
                      ) : (
                        <Bot className='h-4 w-4' />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-full",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.content === "" &&
                    message.role === "assistant" &&
                    isLoading ? (
                      <div className='flex items-center gap-1'>
                        <div className='typing-indicator'></div>
                        <div className='typing-indicator'></div>
                        <div className='typing-indicator'></div>
                      </div>
                    ) : (
                      <div>
                        <p className='text-sm whitespace-pre-wrap break-words'>
                          {message.content}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1 opacity-70",
                            message.role === "user" ? "text-right" : "text-left"
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className='chat-input-area'>
            <div className='flex gap-2'>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Type your message here...'
                disabled={isLoading}
                className='flex-1'
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size='icon'
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatInterface;
