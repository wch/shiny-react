# Example 9: Blended React + Shiny UI

This example demonstrates a "blended" architecture where React handles the layout and navigation chrome while native Shiny UI elements live inside each panel. This approach enables custom React-powered layouts with full Shiny reactivity and state management.

## Overview

The blended pattern combines the best of both worlds:

- **React manages the layout**: A collapsible sidebar with navigation tabs, smooth animations, and custom styling
- **Shiny handles the content**: Traditional Shiny inputs and outputs (`plotOutput`, `textInput`, etc.) rendered inside React containers
- **Full reactivity preserved**: All Shiny reactive bindings work normally, with proper initialization and cleanup

This is particularly useful when you want React's sophisticated UI components (like custom sidebars, navigation, or layout systems) but prefer writing application logic and outputs in R.

## Key Concept: Slot Preservation Pattern

The implementation uses a "slot preservation" pattern to seamlessly integrate Shiny content into React components:

1. **R renders Shiny UI** as children of a custom HTML element (`<react-sidebar-layout>`)
2. **Custom element captures children** before React renders, storing the Shiny content by panel ID
3. **React renders the layout** with empty container refs for each panel
4. **Content is moved** into React containers after mount using `appendChild`
5. **`Shiny.bindAll()`** initializes bindings to activate inputs/outputs

This approach preserves Shiny's DOM structure and reactive bindings while giving React full control over layout and navigation.

## R API

### `react_sidebar_layout(...)`

Main container for the blended layout. Accepts `react_nav_panel()` children and configuration options.

**Parameters:**
- `...` - One or more `react_nav_panel()` elements
- `id` - Optional ID for the layout container (enables Shiny module namespacing)
- `title` - Optional title displayed in the sidebar header
- `collapsible` - Whether sidebar can collapse (default: `TRUE`)
- `default_open` - Whether sidebar starts open (default: `TRUE`)
- `position` - Sidebar position: `"left"` or `"right"` (default: `"left"`)
- `width` - Sidebar width when open (default: `"250px"`)

### `react_nav_panel(title, ..., icon, value)`

Defines a navigation panel containing Shiny UI elements.

**Parameters:**
- `title` - Display title for the navigation item
- `...` - Shiny UI elements to display in the panel
- `icon` - Optional icon (supports `bsicons::bs_icon()` or `fontawesome::fa()`)
- `value` - Panel identifier (defaults to `title`)

### Example

```r
library(shiny)
library(bslib)
library(bsicons)

ui <- page_fillable(
  react_sidebar_layout(
    title = "My App",

    react_nav_panel(
      "Dashboard",
      icon = bs_icon("bar-chart-fill"),
      card(
        card_header("Sales Overview"),
        plotOutput("salesPlot")
      ),
      sliderInput("months", "Months:", min = 1, max = 12, value = 6)
    ),

    react_nav_panel(
      "Settings",
      icon = bs_icon("gear-fill"),
      textInput("username", "Username:"),
      checkboxInput("darkMode", "Dark Mode", FALSE)
    )
  )
)

server <- function(input, output, session) {
  output$salesPlot <- renderPlot({
    # Plot logic using input$months
  })
}

shinyApp(ui, server)
```

## Running the Example

### Prerequisites

- Node.js (for building TypeScript)
- R with packages: `shiny`, `bslib`, `bsicons`

### Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run with hot reloading (auto-rebuilds on file changes)
npm run dev-r
```

The app will be available at http://localhost:8000 (or the port specified by `R_PORT` environment variable).

## Technical Details

### Sidebar State Management

- Collapse/expand state is managed by React's `useState`
- Sidebar width transitions smoothly when toggled
- Collapse button icon direction adapts to sidebar position (left/right)

### Panel Switching

- Uses `visibility` CSS property instead of `display: none` to preserve Shiny state
- Active panel: `visibility: visible; position: relative`
- Inactive panels: `visibility: hidden; position: absolute`
- This prevents Shiny from unbinding inputs/outputs when switching panels

### Icon Rendering

- Icons from `bsicons::bs_icon()` or `fontawesome::fa()` are rendered as SVG strings
- SVG content is injected using `dangerouslySetInnerHTML` in React
- Tooltip shows full panel title when sidebar is collapsed

### Module Support

- Full Shiny module namespace support via `id` parameter on `react_sidebar_layout()`
- When `id` is set, the custom element wraps React components in `<ShinyModuleProvider>`
- All Shiny inputs/outputs inside panels are automatically namespaced

## Known Limitations / Future Work

- **Plot resizing**: Plots may need manual resize triggers when switching panels (Shiny plots don't automatically detect visibility changes)
- **Complex outputs**: Some Shiny outputs with custom initialization may need additional handling in the `onPanelMount` callback
- **Animation smoothness**: Panel switching is instant; could add fade transitions for better UX
- **Accessibility**: Keyboard navigation between panels could be enhanced

## File Structure

```
9-blended/
├── r/
│   ├── app.R              # Main Shiny application
│   ├── shinyreact.R       # R API functions (react_sidebar_layout, etc.)
│   └── www/               # Built assets (generated by npm run build)
│       ├── sidebar.js     # Bundled React code
│       └── sidebar.css    # Generated styles
├── srcts/
│   ├── main.tsx           # Custom element definition & registration
│   ├── SidebarLayout.tsx  # React component for sidebar UI
│   └── styles.css         # Component styles
├── package.json           # Node.js dependencies and build scripts
└── README.md              # This file
```

## Learn More

- See [shiny-react documentation](../../README.md) for more blended patterns
- Example 8 demonstrates pure React components with Shiny communication
- Example 10 shows advanced patterns with dynamic content injection
