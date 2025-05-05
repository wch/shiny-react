import React from "react";
import { createRoot } from "react-dom/client";
import ExampleComponent from "./ExampleComponent";
// import Page from "../app/dashboard/page";
import "../styles/globals.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  // root.render(<Page />);
  root.render(<ExampleComponent />);
} else {
  console.error("Could not find root element to mount React component.");
}
