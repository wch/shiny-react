import React, { useRef, useEffect, useState } from "react";
import { useShinyInput, useShinyOutput } from "../../hooks/use-shiny";
import { cn } from "@/lib/utils";
import { debounce } from "../../utils";

export type ImageData = {
  src: string;
  width: number;
  height: number;
  coordmap: {
    panels: {
      panel: number;
      row: number;
      col: number;
      domain: {
        left: number;
        right: number;
        bottom: number;
        top: number;
      };
      range: {
        left: number;
        right: number;
        bottom: number;
        top: number;
      };
      log: {
        x: string | null;
        y: string | null;
      };
      mapping: {
        x: string | null;
        y: string | null;
      };
    }[];
    dims: {
      width: number;
      height: number;
    };
  };
};

function ImageComponent({ id, className }: { id: string; className?: string }) {
  const [imgWidth, setImgWidth] = useShinyInput<number | null>(
    ".clientdata_output_" + id + "_width",
    null
  );
  const [imgHeight, setImgHeight] = useShinyInput<number | null>(
    ".clientdata_output_" + id + "_height",
    null
  );

  // Track if the image is hidden
  const [imgHidden] = useShinyInput<boolean>(
    ".clientdata_output_" + id + "_hidden",
    false
  );
  const [imgData, imgRecalculating] = useShinyOutput<ImageData>(id, undefined);

  // Create a reference to the img element to access its properties
  const imgRef = useRef<HTMLImageElement>(null);

  // Track when the image data changes
  const [imageVersion, setImageVersion] = useState(0);

  // Update the version when imgData changes
  useEffect(() => {
    if (imgData) {
      setImageVersion((prev) => prev + 1);
    }
  }, [imgData]);

  // Handle image load and dimension changes
  const handleImageLoad = () => {
    if (imgRef.current) {
      const width = imgRef.current.clientWidth;
      const height = imgRef.current.clientHeight;
      console.log("Image loaded - Width:", width, "Height:", height);
      setImgWidth(width);
      setImgHeight(height);
    }
  };

  // Set up a mutation observer to detect image dimension changes
  useEffect(() => {
    console.log("Image dimensions changed");
    const img = imgRef.current;
    if (!img) return;

    // Set initial dimensions when the image first loads
    img.addEventListener("load", handleImageLoad);

    // Create a debounced version of handleImageLoad with 200ms delay
    const debouncedHandleResize = debounce(() => {
      if (img && img.complete) {
        handleImageLoad();
      }
    }, 400);

    // Create a ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === img) {
          debouncedHandleResize();
        }
      }
    });

    resizeObserver.observe(img);

    return () => {
      img.removeEventListener("load", handleImageLoad);
      resizeObserver.disconnect();
    };
  }, [imgRef, imageVersion, setImgWidth, setImgHeight]);

  return (
    <img
      ref={imgRef}
      src={imgData?.src}
      alt=""
      className={cn(
        className,
        "w-full h-[300px]",
        imgHidden ? "hidden" : "",
        imgRecalculating ? "opacity-40" : ""
      )}
      onLoad={handleImageLoad}
    />
  );
}

export default ImageComponent;
