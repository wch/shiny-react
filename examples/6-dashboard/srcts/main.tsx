import { createRoot } from "react-dom/client";
import { Dashboard } from "@/components/Dashboard";
import "./globals.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Dashboard />);
} else {
  console.error("Could not find root element to mount React component.");
}
