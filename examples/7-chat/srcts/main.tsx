import ChatInterface from "@/components/ChatInterface";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/globals.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  );
} else {
  console.error("Could not find root element to mount React component.");
}
