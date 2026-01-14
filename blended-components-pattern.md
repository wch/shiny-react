# Blended Components Pattern

Best practices for creating React components that wrap native Shiny UI elements, designed to integrate seamlessly with Shiny + bslib (R) or Shiny for Python applications.

## Overview

A "blended" component uses React to provide custom layout, interactivity, or visual chrome while allowing native Shiny UI elements (inputs, outputs, bslib components) to live inside. This pattern enables:

- Custom layouts not available in standard Shiny/bslib
- React-powered animations and interactions
- Full Shiny reactivity within React-managed containers
- Seamless visual integration with bslib themes

## Core Pattern: Slot Preservation

The fundamental challenge is that React manages its own DOM, but Shiny UI elements need to:
1. Be rendered by Shiny's tag system (R or Python)
2. Have their bindings initialized by `Shiny.bindAll()`
3. Maintain state when hidden/shown

**Solution: Capture, Render, Restore, Bind**

```
1. R/Python renders Shiny content as children of a custom element
2. Custom element's connectedCallback() captures children before React renders
3. React renders layout with empty container refs
4. Captured content is moved into React containers after mount
5. Shiny.bindAll() initializes bindings on each container
```

## Implementation Layers

### Layer 1: R/Python API

Create wrapper functions that feel natural to Shiny users:

```r
# Container function
my_layout <- function(..., id = NULL, option = "default") {
  items <- list(...)

  # Extract metadata for React
  item_config <- lapply(items, function(item) {
    list(
      id = item$attribs$`data-item-id`,
      label = item$attribs$`data-item-label`
    )
  })

  tagList(
    # Include JS/CSS dependencies
    tags$head(
      tags$script(src = "my-component.js", type = "module"),
      tags$link(href = "my-component.css", rel = "stylesheet")
    ),
    # Custom element with configuration and Shiny content
    tag("my-custom-element", list(
      id = id,
      `data-config` = jsonlite::toJSON(item_config, auto_unbox = TRUE),
      `data-option` = option,
      items  # Shiny content as children
    ))
  )
}

# Item wrapper (marks content for React to find)
my_item <- function(label, ..., id = label) {
  div(
    `data-item-id` = id,
    `data-item-label` = label,
    class = "my-component-item",
    style = "display: none;",  # Hidden until React takes over
    ...
  )
}
```

**Key patterns:**
- Use `data-*` attributes to pass configuration to React
- Wrap Shiny content in identifiable containers (`data-item-id`)
- Hide content initially (`display: none`) to prevent flash
- Include JS/CSS via `tags$head()`

### Layer 2: Custom Element (TypeScript)

The custom element bridges Shiny's DOM and React:

```typescript
import { createRoot, Root } from "react-dom/client";
import { ShinyModuleProvider } from "@posit/shiny-react";
import { MyComponent } from "./MyComponent";

class MyCustomElement extends HTMLElement {
  private root: Root | null = null;
  private itemContents: Map<string, Node[]> = new Map();

  connectedCallback() {
    // 1. CAPTURE: Store Shiny content before React clears DOM
    const itemDivs = this.querySelectorAll('[data-item-id]');
    itemDivs.forEach(div => {
      const itemId = div.getAttribute('data-item-id')!;
      this.itemContents.set(itemId, Array.from(div.childNodes));
    });

    // 2. PARSE: Read configuration from attributes
    const config = JSON.parse(this.dataset.config || '[]');
    const option = this.dataset.option || 'default';
    const namespace = this.id || undefined;

    // 3. RENDER: Clear and create React root
    this.innerHTML = '';
    this.root = createRoot(this);

    // 4. Wrap in ShinyModuleProvider if namespaced
    const element = (
      <MyComponent
        config={config}
        option={option}
        onItemMount={this.handleItemMount}
      />
    );

    this.root.render(
      namespace
        ? <ShinyModuleProvider namespace={namespace}>{element}</ShinyModuleProvider>
        : element
    );
  }

  // 5. RESTORE + BIND: Move content back and initialize Shiny
  private handleItemMount = (itemId: string, containerEl: HTMLElement | null) => {
    const content = this.itemContents.get(itemId);
    if (content && containerEl) {
      content.forEach(node => containerEl.appendChild(node));
      window.Shiny?.bindAll?.(containerEl);
    }
  };

  disconnectedCallback() {
    // Clean up: unbind Shiny, unmount React
    window.Shiny?.unbindAll?.(this);
    this.root?.unmount();
    this.root = null;
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

**Key patterns:**
- Capture children in `connectedCallback()` before any DOM manipulation
- Pass `onItemMount` callback to React component
- Call `Shiny.bindAll()` after moving content to initialize bindings
- Call `Shiny.unbindAll()` in `disconnectedCallback()` for cleanup
- Wrap in `ShinyModuleProvider` when `id` is present for namespace support

### Layer 3: React Component

The React component manages layout and provides container refs:

```typescript
import { useState, useEffect, useRef } from "react";

interface MyComponentProps {
  config: Array<{ id: string; label: string }>;
  option: string;
  onItemMount: (itemId: string, containerEl: HTMLElement | null) => void;
}

export function MyComponent({ config, option, onItemMount }: MyComponentProps) {
  const [activeItem, setActiveItem] = useState(config[0]?.id || '');
  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const mountedItems = useRef<Set<string>>(new Set());

  // Call onItemMount once per item after initial render
  useEffect(() => {
    config.forEach(item => {
      if (!mountedItems.current.has(item.id)) {
        const containerEl = itemRefs.current.get(item.id);
        if (containerEl) {
          onItemMount(item.id, containerEl);
          mountedItems.current.add(item.id);
        }
      }
    });
  }, [config, onItemMount]);

  return (
    <div className="my-component">
      {/* React-controlled chrome */}
      <nav>
        {config.map(item => (
          <button key={item.id} onClick={() => setActiveItem(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Containers for Shiny content */}
      <main>
        {config.map(item => (
          <div
            key={item.id}
            ref={el => itemRefs.current.set(item.id, el)}
            className={activeItem === item.id ? 'active' : 'inactive'}
          />
        ))}
      </main>
    </div>
  );
}
```

**Key patterns:**
- Track mounted items to call `onItemMount` only once per container
- Use refs to provide DOM elements back to the custom element
- Empty container divs—content comes from Shiny via `onItemMount`

### Layer 4: CSS Styling

**Critical: Use Bootstrap CSS Variables**

For seamless integration with bslib themes, reference Bootstrap's CSS custom properties with sensible fallbacks:

```css
:root {
  /* Map component variables to Bootstrap variables */
  --my-bg: var(--bs-secondary-bg, #f8f9fa);
  --my-text: var(--bs-body-color, #212529);
  --my-hover: var(--bs-tertiary-bg, #e9ecef);
  --my-active: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.15);
  --my-active-text: var(--bs-primary, #0d6efd);
  --my-border: var(--bs-border-color, #dee2e6);
  --my-content-bg: var(--bs-body-bg, #fff);
}

.my-component {
  background-color: var(--my-bg);
  color: var(--my-text);
  border: 1px solid var(--my-border);
}

.my-component button:hover {
  background-color: var(--my-hover);
}

.my-component button.active {
  background-color: var(--my-active);
  color: var(--my-active-text);
}

.my-component main {
  background-color: var(--my-content-bg);
}
```

**Common Bootstrap CSS variables:**
| Variable | Usage |
|----------|-------|
| `--bs-body-bg` | Page/content background |
| `--bs-body-color` | Primary text color |
| `--bs-secondary-bg` | Secondary backgrounds (cards, sidebars) |
| `--bs-tertiary-bg` | Hover states, subtle backgrounds |
| `--bs-primary` | Primary accent color |
| `--bs-primary-rgb` | Primary as RGB for rgba() |
| `--bs-border-color` | Standard border color |
| `--bs-border-radius` | Standard border radius |

### Visibility vs Display for Hidden Panels

**Use `visibility: hidden` instead of `display: none`** to preserve Shiny state:

```css
.panel {
  position: absolute;
  width: 100%;
  height: 100%;
  visibility: hidden;
  pointer-events: none;
}

.panel.active {
  visibility: visible;
  pointer-events: auto;
}
```

Why this matters:
- `display: none` removes elements from layout, which can reset some Shiny input states
- `visibility: hidden` keeps elements in the DOM with their state intact
- Use `pointer-events: none` to prevent interaction with hidden panels

## Module Namespace Support

For components used within Shiny modules:

**R side:** Apply `NS(id)` to child inputs/outputs:
```r
my_module_ui <- function(id) {
  ns <- NS(id)
  my_layout(
    id = ns("layout"),  # Namespace the container
    my_item("Panel 1",
      plotOutput(ns("plot"))  # Namespace child outputs
    )
  )
}
```

**TypeScript side:** Wrap in `ShinyModuleProvider`:
```typescript
const element = <MyComponent {...props} />;

this.root.render(
  namespace
    ? <ShinyModuleProvider namespace={namespace}>{element}</ShinyModuleProvider>
    : element
);
```

The Shiny content is already namespaced by R—`ShinyModuleProvider` only affects React hooks (like `useShinyInput`) used within the component itself.

## Icons

Accept icons from bsicons or fontawesome, which render to SVG strings:

**R side:**
```r
my_item <- function(label, ..., icon = NULL) {
  icon_svg <- if (!is.null(icon)) {
    if (inherits(icon, "shiny.tag")) as.character(icon) else icon
  } else NULL

  div(`data-icon` = icon_svg, ...)
}
```

**React side:**
```tsx
{icon && (
  <span
    className="icon"
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)}
```

**CSS for SVG icons:**
```css
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;  /* Inherit text color */
}
```

## Checklist for New Blended Components

- [ ] R/Python wrapper functions with `data-*` attributes for configuration
- [ ] Child content wrapped in identifiable containers (`data-item-id`)
- [ ] Custom element captures children in `connectedCallback()`
- [ ] React renders empty container refs
- [ ] `onItemMount` callback moves content and calls `Shiny.bindAll()`
- [ ] `disconnectedCallback()` calls `Shiny.unbindAll()` and unmounts React
- [ ] CSS uses Bootstrap variables (`--bs-*`) with fallbacks
- [ ] Hidden panels use `visibility: hidden`, not `display: none`
- [ ] Module namespace support via `ShinyModuleProvider`
- [ ] Icons accept shiny.tag objects and render SVG with `currentColor`

## Common Pitfalls

1. **Forgetting `Shiny.bindAll()`** — Inputs won't work
2. **Using `display: none`** — Can lose Shiny input state
3. **Hardcoded colors** — Won't match bslib themes
4. **Missing fallbacks** — CSS variables need defaults for non-Bootstrap contexts
5. **Calling `onItemMount` multiple times** — Track mounted items to call only once
6. **Not unbinding on disconnect** — Can cause memory leaks or stale handlers
