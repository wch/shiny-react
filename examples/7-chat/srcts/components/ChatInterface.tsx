import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Bot, Plus, Send, User, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";

interface ImageAttachment {
  name: string;
  content: string; // base64 encoded data
  type: string; // MIME type
  size: number; // file size in bytes
}

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // File handling constants and functions
  const MAX_FILE_SIZE_MB = 5;
  const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newAttachments: ImageAttachment[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(error); // In production, you'd want better error handling
        continue;
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data:image/...;base64, prefix
          const base64 = result.split(",")[1];
          resolve(base64);
        };
      });

      reader.readAsDataURL(file);
      const base64Content = await base64Promise;

      newAttachments.push({
        name: file.name,
        content: base64Content,
        type: file.type,
        size: file.size,
      });
    }

    setCurrentAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  // Drag and drop handlers with improved event handling
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setDragCounter(0);

      if (isLoading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [isLoading, processFiles]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => prev + 1);

    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsDragOver(false);
        return 0;
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
      // Reset the input value so the same file can be selected again
      e.target.value = "";
    },
    [processFiles]
  );

  const removeAttachment = useCallback((index: number) => {
    setCurrentAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
            <div className='max-w-4xl mx-auto space-y-3'>
              {/* Image Previews */}
              {currentAttachments.length > 0 && (
                <div className='space-y-2'>
                  <div className='text-xs text-muted-foreground'>
                    {currentAttachments.length} image
                    {currentAttachments.length !== 1 ? "s" : ""} attached
                  </div>
                  <div className='grid grid-cols-4 gap-2'>
                    {currentAttachments.map((attachment, index) => (
                      <div
                        key={index}
                        className='relative border rounded-lg overflow-hidden bg-muted/50'
                      >
                        <div className='aspect-square relative'>
                          <img
                            src={`data:${attachment.type};base64,${attachment.content}`}
                            alt={attachment.name}
                            className='w-full h-full object-cover'
                          />
                          <Button
                            size='sm'
                            variant='secondary'
                            className='absolute top-1 right-1 h-5 w-5 p-0'
                            onClick={() => removeAttachment(index)}
                            disabled={isLoading}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                        <div className='p-1'>
                          <div className='text-xs truncate font-medium'>
                            {attachment.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Input with Drag and Drop */}
              <div
                className={cn(
                  "relative flex gap-2 p-2 rounded-lg border transition-colors",
                  isDragOver && !isLoading
                    ? "border-primary bg-primary/10"
                    : "border-input",
                  isLoading && "opacity-50"
                )}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
              >
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type='file'
                  className='sr-only'
                  accept={SUPPORTED_IMAGE_TYPES.join(",")}
                  multiple
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />

                {/* Plus Icon Button */}
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  className={cn(
                    "h-8 w-8 flex-shrink-0",
                    isDragOver && "pointer-events-none"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Plus className='h-4 w-4' />
                </Button>

                {/* Text Input */}
                <input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isDragOver
                      ? "Drop images here..."
                      : "Type your message here..."
                  }
                  disabled={isLoading}
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm",
                    isDragOver && "pointer-events-none"
                  )}
                />

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    (!inputValue.trim() && currentAttachments.length === 0) ||
                    isLoading
                  }
                  size='icon'
                  className={cn(
                    "h-8 w-8 flex-shrink-0",
                    isDragOver && "pointer-events-none"
                  )}
                >
                  <Send className='h-4 w-4' />
                </Button>

                {/* Drag Over Overlay */}
                {isDragOver && !isLoading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg pointer-events-none z-10'>
                    <div className='text-sm font-medium text-primary'>
                      Drop images here
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatInterface;
