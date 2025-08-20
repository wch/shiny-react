import { createRoot } from "react-dom/client";
import ExampleComponent from "./ExampleComponent";
import "../styles/globals.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<ExampleComponent />);
} else {
  console.error("Could not find root element to mount React component.");
}

const container2 = document.getElementById("root2");
if (container2) {
  const root2 = createRoot(container2);
  root2.render(<ExampleComponent />);
  // This instance is optional, so don't error if it's not found.
}
