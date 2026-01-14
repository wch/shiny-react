import { createRoot, type Root } from "react-dom/client";
import { ShinyModuleProvider } from "./ShinyModuleContext";

/**
 * Base class for creating custom elements that render React components
 * with automatic Shiny integration.
 *
 * Features:
 * - Automatic namespace support via ShinyModuleProvider (uses element's id)
 * - Slot preservation for blended React + Shiny content
 * - Config parsing from data-* attributes (with JSON auto-parsing)
 * - Proper Shiny binding lifecycle (bindAll/unbindAll)
 * - Default slot capture: When no [data-slot] elements are found, all children
 *   are captured under the reserved slot name "__children__"
 *
 * @example Simple widget (no slots):
 * ```typescript
 * class MyCounterElement extends ShinyReactComponentElement {
 *   static component = CounterWidget;
 * }
 * customElements.define('my-counter', MyCounterElement);
 * ```
 *
 * @example Blended component (with slots):
 * ```typescript
 * class MySidebarElement extends ShinyReactComponentElement {
 *   static component = SidebarLayout;
 *
 *   protected render() {
 *     return <SidebarLayout {...this.getConfig()} onSlotMount={this.onSlotMount} />;
 *   }
 * }
 * customElements.define('my-sidebar', MySidebarElement);
 * ```
 *
 * @example Skip clearing innerHTML (rare):
 * ```typescript
 * class MyOverlayElement extends ShinyReactComponentElement {
 *   protected clearContent() {} // no-op
 * }
 * ```
 */
export class ShinyReactComponentElement extends HTMLElement {
  protected root: Root | null = null;
  protected slotContents: Map<string, Node[]> = new Map();

  /**
   * The React component to render. Set this on your subclass.
   * @example
   * ```typescript
   * class MyElement extends ShinyReactComponentElement {
   *   static component = MyReactComponent;
   * }
   * ```
   */
  static component: React.ComponentType<Record<string, unknown>> | null = null;

  /**
   * Captures children with [data-slot] attribute, storing their contents
   * keyed by slot name. Called automatically in connectedCallback.
   *
   * If no [data-slot] elements are found and the element has child nodes,
   * all children are captured under the reserved slot name "__children__".
   * This provides a default slot for components that don't use named slots.
   *
   * @param selector CSS selector for slot containers (default: '[data-slot]')
   * @returns Map of slot names to their child nodes
   */
  protected captureSlots(
    selector: string = "[data-slot]",
  ): Map<string, Node[]> {
    const elements = this.querySelectorAll(selector);
    if (elements.length === 0) {
      // No named slots - capture all children as default slot
      if (this.childNodes.length > 0) {
        this.slotContents.set("__children__", Array.from(this.childNodes));
      }
    } else {
      // Named slots found - capture each one
      elements.forEach((el) => {
        const slotName = el.getAttribute("data-slot");
        if (slotName) {
          this.slotContents.set(slotName, Array.from(el.childNodes));
        }
      });
    }
    return this.slotContents;
  }

  /**
   * Moves captured slot content into a container element and initializes
   * Shiny bindings. Call this from your React component via onSlotMount callback.
   *
   * @param slotName The slot identifier (from data-slot attribute)
   * @param container The DOM element to move content into
   */
  protected async mountSlot(
    slotName: string,
    container: HTMLElement | null,
  ): Promise<void> {
    const content = this.slotContents.get(slotName);
    if (content && container) {
      content.forEach((node) => container.appendChild(node));
      await window.Shiny?.bindAll?.(container);
    }
  }

  /**
   * Bound callback for mounting slots. Pass this to your React component
   * to handle slot content mounting.
   *
   * @example
   * ```typescript
   * protected render() {
   *   return <MyLayout onSlotMount={this.onSlotMount} />;
   * }
   * ```
   */
  protected get onSlotMount(): (
    slotName: string,
    el: HTMLElement | null,
  ) => Promise<void> {
    return this.mountSlot.bind(this);
  }

  /**
   * Converts data-* attributes to a props object.
   * Automatically attempts JSON parsing for rich values (numbers, booleans,
   * arrays, objects). Falls back to string if parsing fails.
   *
   * @returns Config object with parsed data attributes
   *
   * @example
   * ```html
   * <my-element data-count="5" data-enabled="true" data-items="[1,2,3]" data-title="Hello">
   * ```
   * Results in: { count: 5, enabled: true, items: [1,2,3], title: "Hello" }
   */
  protected getConfig(): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.dataset)) {
      if (value === undefined) continue;
      try {
        config[key] = JSON.parse(value);
      } catch {
        config[key] = value;
      }
    }
    return config;
  }

  /**
   * The namespace for Shiny module support, derived from the element's id.
   * Returns undefined if no id is set.
   */
  protected get namespace(): string | undefined {
    return this.id || undefined;
  }

  /**
   * Renders the React component. Override this to customize rendering,
   * pass additional props, or wrap in providers.
   *
   * @returns React node to render
   */
  protected render(): React.ReactNode {
    const Component = (this.constructor as typeof ShinyReactComponentElement)
      .component;
    if (!Component) {
      console.error(`${this.constructor.name}: No static component defined`);
      return null;
    }
    return <Component {...this.getConfig()} />;
  }

  /**
   * Wraps content in ShinyModuleProvider if namespace exists.
   */
  private wrapWithProvider(content: React.ReactNode): React.ReactNode {
    if (this.namespace) {
      return (
        <ShinyModuleProvider namespace={this.namespace}>
          {content}
        </ShinyModuleProvider>
      );
    }
    return content;
  }

  /**
   * Clears the element's innerHTML before React renders.
   * Override with a no-op if you need to preserve existing content.
   */
  protected clearContent(): void {
    this.innerHTML = "";
  }

  /**
   * Called when the element is added to the DOM.
   * Captures slots, clears content, and renders the React component.
   */
  connectedCallback(): void {
    this.captureSlots();
    this.clearContent();
    this.root = createRoot(this);
    this.root.render(this.wrapWithProvider(this.render()));
  }

  /**
   * Called when the element is removed from the DOM.
   * Unbinds Shiny and unmounts the React root.
   */
  disconnectedCallback(): void {
    window.Shiny?.unbindAll?.(this);
    this.root?.unmount();
    this.root = null;
  }
}
