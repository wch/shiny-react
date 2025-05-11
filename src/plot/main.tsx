import { createRoot } from "react-dom/client";
import PlotDemo from "./PlotDemo";
import "../styles/globals.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PlotDemo />);
} else {
  console.error("Could not find root element to mount React component.");
}
