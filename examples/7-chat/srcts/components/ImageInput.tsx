import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Send } from "lucide-react";
import React, { useCallback, useRef } from "react";
import { ImageAttachment, useImageUpload } from "@/hooks/useImageUpload";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { ImagePreview } from "./ImagePreview";

interface ImageInputProps {
  attachments: ImageAttachment[];
  onAttachmentsChange: (attachments: ImageAttachment[]) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ImageInput({
  attachments,
  onAttachmentsChange,
  inputValue,
  onInputChange,
  onSend,
  onKeyPress,
  isLoading = false,
  placeholder = "Type your message here...",
  className = "",
}: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { processFiles, SUPPORTED_IMAGE_TYPES } = useImageUpload();
  const {
    isDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop();

  const handleFilesSelected = useCallback(async (files: FileList) => {
    if (isLoading) return;
    
    const newAttachments = await processFiles(files);
    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  }, [attachments, isLoading, onAttachmentsChange, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  }, [handleFilesSelected]);

  const handleDropFiles = useCallback((e: React.DragEvent) => {
    handleDrop(e, handleFilesSelected);
  }, [handleDrop, handleFilesSelected]);

  const removeAttachment = useCallback((index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  }, [attachments, onAttachmentsChange]);

  const canSend = (inputValue.trim() || attachments.length > 0) && !isLoading;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Image Previews */}
      <ImagePreview
        attachments={attachments}
        onRemove={removeAttachment}
        isLoading={isLoading}
      />

      {/* Text Input with Drag and Drop */}
      <div
        className={cn(
          "relative flex gap-2 p-2 rounded-lg border transition-colors",
          isDragOver && !isLoading
            ? "border-primary bg-primary/10"
            : "border-input",
          isLoading && "opacity-50"
        )}
        onDrop={handleDropFiles}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept={SUPPORTED_IMAGE_TYPES.join(",")}
          multiple
          onChange={handleFileInputChange}
          disabled={isLoading}
        />

        {/* Plus Icon Button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 flex-shrink-0",
            isDragOver && "pointer-events-none"
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Attach images"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isDragOver ? "Drop images here..." : placeholder}
          disabled={isLoading}
          className={cn(
            "flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm",
            isDragOver && "pointer-events-none"
          )}
        />

        {/* Send Button */}
        <Button
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          className={cn(
            "h-8 w-8 flex-shrink-0",
            isDragOver && "pointer-events-none"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Drag Over Overlay */}
        {isDragOver && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg pointer-events-none z-10">
            <div className="text-sm font-medium text-primary">
              Drop images here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}