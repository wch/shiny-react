# Example 8: Shiny Module Namespaces

This example demonstrates how to use shiny-react with Shiny module namespaces to create multiple independent React widgets on a single page.

## Two Variants

This example includes two variants that demonstrate different use cases:

### 1. Full React App (`app.R` / `app.py`)

A single-page React application that uses `page_react()`. This is best for when your entire UI is built in React.

**Features:**
- Uses `page_react()` to create a full React app
- All UI defined in React components
- Three counter instances with different namespaces

**Run it:**
```bash
# R version
npm run dev-r

# Python version
npm run dev-py
```

### 2. Standard Shiny App (`app-standard.R` / `app-standard.py`) ⭐

A traditional Shiny/bslib app that embeds React widgets as reusable components. This is the **recommended approach** for integrating React components into existing Shiny applications.

**Features:**
- Uses standard Shiny UI (bslib cards in R, standard layout in Python)
- React widgets are embedded as custom components
- Clean API: `counter_ui(id, title)` and `counter_server(id)`
- The `counter_server()` function returns a reactive value for the current count
- Demonstrates proper module pattern for reusable widgets
- **Dynamic rendering**: Add and remove counter widgets on the fly using action buttons
- Custom web element (`<counter-widget>`) handles automatic React initialization and cleanup

**Run it:**
```bash
# R version (port 8000)
npm run dev-standard-r

# Python version (port 8001)
npm run dev-standard-py

# Or run both
npm run dev-standard
```

## How the Standard Variant Works

### Client-Side (React)

The React widget uses a custom web element that automatically initializes when added to the DOM:

```tsx
// main.tsx
class CounterWidgetElement extends HTMLElement {
  private root: Root | null = null;

  connectedCallback() {
    const namespace = this.id;
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

customElements.define("counter-widget", CounterWidgetElement);
```

This custom element approach:
- Uses the standard HTML `id` attribute (familiar to Shiny users)
- Automatically initializes React when the element is added to the DOM
- Properly cleans up when the element is removed (important for dynamic rendering)
- Works seamlessly with Shiny's `insertUI()` and `removeUI()` functions

**Configuration Pattern:** You can pass additional configuration by reading HTML attributes via `dataset` in `connectedCallback()` and passing them as props to your React component:

```typescript
connectedCallback() {
  const namespace = this.id;
  const title = this.dataset.title || "Default";
  const initialValue = parseInt(this.dataset.initialValue || "0");

  this.root.render(
    <ShinyModuleProvider namespace={namespace}>
      <CounterWidget title={title} initialValue={initialValue} />
    </ShinyModuleProvider>
  );
}
```

Then from R/Python:
```r
tag("counter-widget", list(id = id, `data-title` = "My Title", `data-initial-value` = 10))
```

### Server-Side API

#### R Example

```r
# UI function creates a bslib card with the counter widget
counter_ui <- function(id, title = "Counter") {
  card(
    card_header(title),
    tag(
      "counter-widget",
      list(id = id)  # Standard HTML id attribute
    )
  )
}

# Server function returns a reactive with the current count
counter_server <- function(id) {
  moduleServer(id, function(input, output, session) {
    # ... server logic ...

    reactive({ input$count })  # Return reactive value
  })
}

# Usage in app
ui <- page_fluid(
  counter_ui("counter1", "Counter A"),
  counter_ui("counter2", "Counter B")
)

server <- function(input, output, session) {
  count1 <- counter_server("counter1")
  count2 <- counter_server("counter2")

  # Use the reactive values
  observe({
    print(count1())
    print(count2())
  })
}
```

#### Python Example

```python
def counter_ui(id: str, title: str = "Counter"):
    """Creates a card with the counter widget"""
    return ui.card(
        ui.card_header(title),
        ui.HTML(f'<counter-widget id="{id}"></counter-widget>')
    )

@module.server
def counter_server(input, output, session):
    """Server logic, returns reactive with current count"""
    # ... server logic ...

    @reactive.calc
    def count():
        return input.count() if input.count() is not None else 0

    return count  # Return reactive value

# Usage in app
def server(input, output, session):
    count1 = counter_server("counter1")
    count2 = counter_server("counter2")

    # Use the reactive values
    @reactive.effect
    def _():
        print(count1())
        print(count2())
```

## Key Features Demonstrated

1. **Module Namespacing**: Each widget has its own namespace, preventing ID conflicts
2. **Independent State**: Each counter maintains its own state
3. **Custom Web Element**: Uses `<counter-widget>` custom element with automatic lifecycle management
4. **Dynamic Rendering**: Add and remove widgets dynamically using `insertUI()`/`removeUI()` (R) or `ui.insert_ui()`/`ui.remove_ui()` (Python)
5. **Communication Patterns**:
   - **Inputs**: Client count → Server (via `useShinyInput`)
   - **Outputs**: Server doubled value → Client (via `useShinyOutput`)
   - **Messages**: Server notifications → Client (via `useShinyMessageHandler`)
6. **Reactive Return Values**: Server functions return reactive values that can be used elsewhere in the app
7. **Clean API**: Simple `counter_ui()` and `counter_server()` functions that follow Shiny module patterns

## Build Commands

```bash
# Build everything (both variants for R and Python)
npm run build

# Build individual variants
npm run build-app        # Full React app only
npm run build-standard   # Standard app only

# Development mode (auto-rebuild + run app)
npm run dev              # Full React app (both R and Python, ports 8000/8001)
npm run dev-standard     # Standard app (both R and Python, ports 8000/8001)

# Run specific variants
npm run dev-r            # Full React app (R only, port 8000)
npm run dev-py           # Full React app (Python only, port 8001)
npm run dev-standard-r   # Standard app (R only, port 8000)
npm run dev-standard-py  # Standard app (Python only, port 8001)
```

### Build Output

The build process creates separate JavaScript and CSS files for each variant to avoid conflicts:

- **Full React app**: `app.js` and `app.css` - Single-page React application
- **Standard app**: `widget.js` and `widget.css` - React widgets for embedding

## Directory Structure

```
8-modules/
├── srcts/              # Full React app source
│   ├── App.tsx
│   ├── CounterWidget.tsx
│   ├── main.tsx
│   └── styles.css
├── srcts-standard/     # Standard app widget source
│   ├── CounterWidget.tsx
│   ├── main.tsx
│   └── styles.css
├── r/
│   ├── app.R          # Full React app
│   ├── app-standard.R # Standard app with bslib
│   └── shinyreact.R
├── py/
│   ├── app.py         # Full React app
│   ├── app-standard.py # Standard app
│   └── shinyreact.py
└── package.json
```

## Which Variant Should I Use?

- **Use the Standard variant** (`app-standard`) if you're:
  - Adding React components to an existing Shiny app
  - Building a traditional Shiny app that needs some React widgets
  - Want to follow familiar Shiny module patterns
  - Need to return reactive values from your widgets

- **Use the Full React variant** (`app`) if you're:
  - Building an entirely new app with React
  - Want full control over the entire UI in React
  - Don't need traditional Shiny UI components
