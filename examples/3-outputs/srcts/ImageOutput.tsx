import React from "react";
import { useShinyOutput } from "shiny-react";

interface ImageOutputProps {
  id: string;
  alt?: string;
  className?: string;
}

function ImageOutput({ id, alt, className }: ImageOutputProps) {
  const [imageSrc] = useShinyOutput<string | undefined>(id, undefined);

  if (!imageSrc) {
    return (
      <div className={`image-placeholder ${className || ""}`}>
        Loading plot...
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt || `Plot output ${id}`}
      className={className}
    />
  );
}

export default ImageOutput;