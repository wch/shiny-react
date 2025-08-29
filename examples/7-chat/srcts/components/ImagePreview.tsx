import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";
import { ImageAttachment, useImageUpload } from "@/hooks/useImageUpload";

interface ImagePreviewProps {
  attachments: ImageAttachment[];
  onRemove: (index: number) => void;
  isLoading?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function ImagePreview({ 
  attachments, 
  onRemove, 
  isLoading = false,
  className = "",
  columns = 4
}: ImagePreviewProps) {
  const { formatFileSize } = useImageUpload();

  if (attachments.length === 0) {
    return null;
  }

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  }[columns];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-xs text-muted-foreground">
        {attachments.length} image{attachments.length !== 1 ? "s" : ""} attached
      </div>
      <div className={`grid ${gridColsClass} gap-2`}>
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="relative border rounded-lg overflow-hidden bg-muted/50"
          >
            <div className="aspect-square relative">
              <img
                src={`data:${attachment.type};base64,${attachment.content}`}
                alt={attachment.name}
                className="w-full h-full object-cover"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-1 right-1 h-5 w-5 p-0"
                onClick={() => onRemove(index)}
                disabled={isLoading}
                aria-label={`Remove ${attachment.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="p-1">
              <div className="text-xs truncate font-medium" title={attachment.name}>
                {attachment.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(attachment.size)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}