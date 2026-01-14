import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { ShinyModuleProvider } from "@posit/shiny-react";
import { CounterWidget } from "./CounterWidget";
import "./styles.css";

// Custom element that automatically initializes React when connected to DOM
class CounterWidgetElement extends HTMLElement {
  private root: Root | null = null;

  connectedCallback() {
    const namespace = this.id;

    if (!namespace) {
      console.error("counter-widget missing `id` attribute");
      return;
    }

    // Create React root and render
    this.root = createRoot(this);
    this.root.render(
      <StrictMode>
        <ShinyModuleProvider namespace={namespace}>
          <CounterWidget />
        </ShinyModuleProvider>
      </StrictMode>
    );
  }

  disconnectedCallback() {
    // Clean up React root when element is removed
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

// Register the custom element
customElements.define("counter-widget", CounterWidgetElement);
