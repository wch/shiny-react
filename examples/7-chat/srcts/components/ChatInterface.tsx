import { ImageInput } from "@/components/ImageInput";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { type ImageAttachment } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";
import { useShinyInput } from "@posit/shiny-react";
import { Bot, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatMessage {
  text: string;
  attachments: ImageAttachment[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: ImageAttachment[];
  timestamp: Date;
}

function ChatInterface() {
  const { currentTheme } = useTheme();
  const [currentMessage, setCurrentMessage] = useShinyInput<ChatMessage>(
    "chat_input",
    { text: "", attachments: [] },
    { debounceMs: 0, priority: "event" }
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentAttachments, setCurrentAttachments] = useState<
    ImageAttachment[]
  >([]);
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
    if ((!inputValue.trim() && currentAttachments.length === 0) || isLoading)
      return;

    // Add user message and placeholder assistant message together
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      attachments:
        currentAttachments.length > 0 ? [...currentAttachments] : undefined,
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

    // Send structured message to Shiny server
    setCurrentMessage({
      text: inputValue.trim(),
      attachments: [...currentAttachments],
    });

    // Clear input and attachments
    setInputValue("");
    setCurrentAttachments([]);
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
      <Card className='h-full flex flex-col' data-card>
        <CardHeader className='flex-shrink-0 border-b border-border/50'>
          <CardTitle className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Bot className='h-6 w-6' />
              <span>AI Chat - Shiny React</span>
              <div
                className={cn(
                  "text-xs px-2 py-1 rounded-full opacity-70",
                  currentTheme === "paper" &&
                    "bg-blue-50 border border-blue-200 text-blue-700",
                  currentTheme === "cyberpunk" &&
                    "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-cyan-300",
                  currentTheme === "glassmorphism" &&
                    "bg-white/10 backdrop-blur",
                  currentTheme === "terminal" &&
                    "bg-green-900/20 text-green-400 font-mono",
                  currentTheme === "discord" &&
                    "bg-purple-600/20 text-purple-300",
                  currentTheme === "default" && "bg-gray-100 text-gray-600"
                )}
              >
                {currentTheme}
              </div>
            </div>
            <ThemeSwitcher />
          </CardTitle>
        </CardHeader>

        <CardContent className='flex-1 flex flex-col p-0 min-h-0'>
          {/* Messages Area */}
          <ScrollArea
            ref={scrollAreaRef}
            className='flex-1 p-4 overflow-hidden'
          >
            <div className='max-w-4xl mx-auto space-y-4'>
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
                    "flex gap-3 max-w-[65%]",
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
                      "message-bubble rounded-lg px-3 py-2 max-w-full",
                      message.role === "user"
                        ? "message-user bg-primary text-primary-foreground"
                        : "message-assistant bg-muted text-muted-foreground"
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
                        {/* Message text content */}
                        {message.content && (
                          <p className='text-sm whitespace-pre-wrap break-words mb-2'>
                            {message.content}
                          </p>
                        )}

                        {/* Message image attachments */}
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div
                              className={cn(
                                "grid gap-2 mb-2",
                                message.attachments.length === 1
                                  ? "grid-cols-1 max-w-xs"
                                  : "grid-cols-2 max-w-sm"
                              )}
                            >
                              {message.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className='rounded-lg overflow-hidden border bg-background'
                                >
                                  <img
                                    src={`data:${attachment.type};base64,${attachment.content}`}
                                    alt={attachment.name}
                                    className='w-full h-auto max-h-48 object-contain'
                                  />
                                  <div className='p-2'>
                                    <div className='text-xs text-muted-foreground truncate'>
                                      {attachment.name}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

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
          <div className='chat-input-area flex-shrink-0'>
            <div className='max-w-4xl mx-auto'>
              <ImageInput
                attachments={currentAttachments}
                onAttachmentsChange={setCurrentAttachments}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                placeholder='Type your message here...'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatInterface;
