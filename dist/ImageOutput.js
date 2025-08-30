import { jsx } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { useShinyInput, useShinyOutput } from "./use-shiny";
import { debounce } from "./utils";
function ImageOutput({
  id,
  className
}) {
  const [imgWidth, setImgWidth] = useShinyInput(
    ".clientdata_output_" + id + "_width",
    null
  );
  const [imgHeight, setImgHeight] = useShinyInput(
    ".clientdata_output_" + id + "_height",
    null
  );
  const [imgHidden] = useShinyInput(
    ".clientdata_output_" + id + "_hidden",
    false
  );
  const [imgData, imgRecalculating] = useShinyOutput(id, void 0);
  const imgRef = useRef(null);
  const [imageVersion, setImageVersion] = useState(0);
  useEffect(() => {
    if (imgData) {
      setImageVersion((prev) => prev + 1);
    }
  }, [imgData]);
  const handleImageLoad = () => {
    if (imgRef.current) {
      const width = imgRef.current.clientWidth;
      const height = imgRef.current.clientHeight;
      console.log("Image loaded - Width:", width, "Height:", height);
      setImgWidth(width);
      setImgHeight(height);
    }
  };
  useEffect(() => {
    console.log("Image dimensions changed");
    const img = imgRef.current;
    if (!img) return;
    img.addEventListener("load", handleImageLoad);
    const debouncedHandleResize = debounce(() => {
      if (img && img.complete) {
        handleImageLoad();
      }
    }, 400);
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
  return /* @__PURE__ */ jsx(
    "img",
    {
      ref: imgRef,
      src: imgData?.src,
      alt: "",
      className,
      style: {
        width: "100%",
        height: "300px",
        display: imgHidden ? "none" : "block",
        opacity: imgRecalculating ? 0.4 : 1
      },
      onLoad: handleImageLoad
    }
  );
}
export {
  ImageOutput
};
//# sourceMappingURL=ImageOutput.js.map
