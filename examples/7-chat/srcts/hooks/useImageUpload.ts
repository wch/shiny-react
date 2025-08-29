import { useCallback } from "react";

export interface ImageAttachment {
  name: string;
  content: string; // base64 encoded data
  type: string;   // MIME type
  size: number;   // file size in bytes
}

export const MAX_FILE_SIZE_MB = 5;
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/gif",
];

export function useImageUpload() {
  const validateFile = useCallback((file: File): string | null => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]): Promise<ImageAttachment[]> => {
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

    return newAttachments;
  }, [validateFile]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }, []);

  return {
    validateFile,
    processFiles,
    formatFileSize,
    MAX_FILE_SIZE_MB,
    SUPPORTED_IMAGE_TYPES,
  };
}