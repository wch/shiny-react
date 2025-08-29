import { createRoot } from "react-dom/client";
import ChatInterface from "@/components/ChatInterface";
import "@/globals.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<ChatInterface />);
} else {
  console.error("Could not find root element to mount React component.");
}