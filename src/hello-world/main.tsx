import React from "react";
import { createRoot } from "react-dom/client";
import HelloWorldComponent from "./HelloWorldComponent";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<HelloWorldComponent />);
} else {
  console.error("Could not find root element to mount React component.");
}
