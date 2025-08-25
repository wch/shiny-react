# CLAUDE.md

This file provides comprehensive guidance to Claude Code and other LLM coding agents when working with Shiny-React applications.

## Project Overview

This is a Shiny-React application created from the hello-world template. Shiny-React is a React bindings library that enables bidirectional communication between React frontend components and Shiny servers (both R and Python), allowing you to build applications with React's frontend reactivity and Shiny's backend reactivity.

**Key Concept**: The frontend uses React's reactivity, and the backend uses Shiny's reactivity. These are both forms of reactivity, but they have differences from each other. Shiny-React bridges these two reactive systems.

**Architecture**: 
- **Frontend**: React with TypeScript using shiny-react hooks
- **Backend**: Shiny server (both R and Python versions available)
- **Communication**: Bidirectional real-time data flow via shiny-react library
- **Build System**: Dual ESBuild bundling for both CommonJS and ESM compatibility

## Directory Structure

```
hello-world-app/
├── package.json              # Build configuration and npm dependencies
├── tsconfig.json            # TypeScript configuration  
├── CLAUDE.md                # This file - instructions for LLM coding agents
├── srcts/                   # React TypeScript source code
│   ├── main.tsx            # React app entry point
│   ├── HelloWorldComponent.tsx  # Main component using shiny-react hooks
│   └── styles.css          # CSS styling
├── r/                      # R Shiny backend
│   ├── app.R              # Main R Shiny application
│   ├── utils.R            # R utility functions (barePage, renderObject)
│   └── www/               # Built JavaScript/CSS output (auto-generated)
│       ├── main.js        # Compiled React code for R backend
│       └── main.css       # Compiled CSS for R backend
└── py/                     # Python Shiny backend
    ├── app.py             # Main Python Shiny application
    ├── utils.py           # Python utility functions (page_bare, render_object)
    └── www/               # Built JavaScript/CSS output (auto-generated)
        ├── main.js        # Compiled React code for Python backend
        └── main.css       # Compiled CSS for Python backend
```

## Key Files and Their Purpose

### Frontend (React/TypeScript)
- **`srcts/main.tsx`**: Entry point that mounts the React app to the DOM
- **`srcts/HelloWorldComponent.tsx`**: Main component demonstrating shiny-react hooks
- **`srcts/styles.css`**: Application styling

### Backend (Shiny)
- **`r/app.R`** or **`py/app.py`**: Main Shiny server application
- **`r/utils.R`** or **`py/utils.py`**: Utility functions for bare page setup and custom renderers
- **`r/www/`** or **`py/www/`**: Auto-generated build output (JavaScript and CSS bundles)

## Build Commands

### Development Workflow
```bash
# Install dependencies
npm install

# Development with hot reload (builds for both R and Python)
npm run watch

# One-time build (builds for both R and Python)
npm run build
```

### Individual Backend Builds
```bash
# Build only for R backend
npm run build-r

# Build only for Python backend  
npm run build-py

# Watch mode for R backend only
npm run watch-r

# Watch mode for Python backend only
npm run watch-py
```

## Running the Application

### Development Setup
1. **Start build watcher** (in one terminal):
   ```bash
   npm run watch
   ```

2. **Run Shiny server** (in another terminal):
   ```bash
   # For R backend
   R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"
   
   # For Python backend  
   shiny run py/app.py --port 8000
   ```

3. **Open browser**: Navigate to `http://localhost:8000`

## How Shiny-React Works

### Core Concepts
- **`useShinyInput<T>(id, defaultValue)`**: Sends data FROM React TO Shiny server
- **`useShinyOutput<T>(id, defaultValue)`**: Receives data FROM Shiny server TO React
- **Real-time bidirectional communication**: Changes in React trigger server updates, server responses update React UI

### Data Flow Pattern
```
React Component ──[useShinyInput]──> Shiny Server
                                           │
                                           ▼
                                    Process/Transform Data
                                           │
                                           ▼
React Component <──[useShinyOutput]── Shiny Server
```

### Code Examples

#### React Component Pattern
```typescript
import { useShinyInput, useShinyOutput } from "shiny-react";

function MyComponent() {
  // Send data to Shiny (like useState but syncs with server)
  const [inputValue, setInputValue] = useShinyInput<string>("my_input", "default");
  
  // Receive data from Shiny
  const outputValue = useShinyOutput<string>("my_output", undefined);

  return (
    <div>
      <input 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
      />
      <div>Server says: {outputValue}</div>
    </div>
  );
}
```

#### R Shiny Server Pattern
```r
server <- function(input, output, session) {
  output$my_output <- renderText({
    toupper(input$my_input)  # Transform the input
  })
}
```

#### Python Shiny Server Pattern
```python
def server(input, output, session):
    @render.text()
    def my_output():
        return input.my_input().upper()  # Transform the input
```

## Common Development Tasks

### Adding a New Input/Output Pair
1. **In React component**: Add `useShinyInput` and `useShinyOutput` hooks
2. **In Shiny server**: Add corresponding input handler and output renderer
3. **Rebuild**: Run `npm run build` or use watch mode

### Adding New React Components
1. **Create component file** in `srcts/` directory
2. **Import and use** in main component or `main.tsx`  
3. **Follow shiny-react patterns** for any Shiny communication
4. **Update styling** in `styles.css` if needed

### Modifying Backend Logic
- **R**: Edit `r/app.R` for server logic, `r/utils.R` for utilities
- **Python**: Edit `py/app.py` for server logic, `py/utils.py` for utilities
- **No rebuild needed** for backend changes (Shiny auto-reloads if configured)

## Architecture Details

### Build System
- **ESBuild**: Bundles React TypeScript code into JavaScript
- **Dual Output**: Creates separate bundles for R (`r/www/`) and Python (`py/www/`) backends
- **CSS Bundling**: Automatically includes CSS in JavaScript bundles
- **TypeScript Compilation**: Provides type checking during development

### Communication Layer
- **ShinyReactRegistry**: Global registry managing input/output mappings
- **Debounced Updates**: Input changes debounced (100ms) to prevent excessive server calls
- **Promise-based Initialization**: Waits for Shiny to initialize before establishing connections
- **Custom Output Binding**: Extends Shiny's output system for React integration

## Troubleshooting

### Common Issues
1. **"Shiny not found" errors**: Ensure Shiny server is running and accessible
2. **Build failures**: Check that all dependencies are installed (`npm install`)
3. **Hot reload not working**: Restart watch mode (`npm run watch`)
4. **Data not syncing**: Verify matching input/output IDs between React and Shiny
5. **TypeScript errors**: Check type definitions and imports

### Development Tips
- **Use browser DevTools**: Check console for React/JavaScript errors
- **Monitor Shiny logs**: Watch R/Python console for server-side errors  
- **Verify IDs match**: Input/output IDs must be identical in React and Shiny code
- **Check network tab**: Verify WebSocket communication between client and server

### Port Conflicts
If port 8000 is in use, change the port:
```bash
# R
R -e "shiny::runApp('r/app.R', port=8001)"

# Python  
shiny run py/app.py --port 8001
```

## Testing Approach
- **Manual testing**: Run the app and verify input/output behavior
- **Browser testing**: Test in different browsers for compatibility
- **Network testing**: Monitor WebSocket connections in browser DevTools
- **Type checking**: Use `npm run watch` for continuous TypeScript validation

## File Extension Patterns
- **`.tsx`**: React components with JSX
- **`.ts`**: TypeScript utility files
- **`.css`**: Styling files  
- **`.R`**: R Shiny server files
- **`.py`**: Python Shiny server files

## Key Dependencies
- **shiny-react**: Core library for React-Shiny communication
- **react + react-dom**: React framework
- **typescript**: TypeScript compiler and type checking
- **esbuild**: Fast JavaScript bundling
- **concurrently**: Run multiple npm scripts simultaneously

---

# Complete Shiny-React Library Documentation

## Core Shiny-React Concepts

### Reactivity Systems Bridge
Shiny-React connects two different reactivity systems:

**Frontend (React)**:
- React components use `useState` and other hooks for state management
- State changes trigger re-renders of components
- Changes flow through component trees via props and context

**Backend (Shiny)**:
- Shiny's reactivity system is a directed graph of reactive values and reactive functions
- Input values are reactive values that trigger re-execution of dependent functions when they change
- Output values are set by reactive functions that automatically re-execute when their inputs change

**The Bridge**:
- `useShinyInput` extends React state to the server (server can read, but not modify)
- `useShinyOutput` brings server reactive values into React components
- Communication happens via WebSocket with debouncing and deduplication

## Complete API Reference

### useShinyInput Hook

```typescript
function useShinyInput<T>(
  id: string, 
  defaultValue: T,
  options?: { debounceMs?: number }
): [T, (value: T) => void]
```

**Purpose**: Sends data FROM React TO Shiny server (similar to `useState` but syncs with server).

**Parameters**:
- `id`: The Shiny input ID (accessed as `input$id` in R or `input.id()` in Python)
- `defaultValue`: Initial value for the input
- `options.debounceMs`: Debounce delay in milliseconds (default: 200ms)

**Returns**: `[value, setValue]` tuple identical to React's `useState`

**Key Behaviors**:
- Values are debounced before sending to prevent excessive server calls
- Values are deduplicated (identical consecutive values are not sent)
- Waits for Shiny initialization before sending values
- Updates are sent to `ShinyReactRegistry` which manages server communication

**Example**: All input types from the 2-inputs example
```typescript
// Text input
const [textValue, setTextValue] = useShinyInput<string>("txtin", "Hello, world!");

// Number input with constraints  
const [numberValue, setNumberValue] = useShinyInput<number>("numberin", 42);

// Boolean checkbox
const [checkboxValue, setCheckboxValue] = useShinyInput<boolean>("checkboxin", false);

// Radio button selection
const [radioValue, setRadioValue] = useShinyInput<string>("radioin", "option1");

// Select dropdown
const [selectValue, setSelectValue] = useShinyInput<string>("selectin", "apple");

// Slider/range input
const [sliderValue, setSliderValue] = useShinyInput<number>("sliderin", 50);

// Date input (HTML5 date picker)
const [dateValue, setDateValue] = useShinyInput<string>("datein", "2024-01-01");

// Button click counter
const [buttonCount, setButtonCount] = useShinyInput<number>("buttonin", 0);
```

### useShinyOutput Hook

```typescript
function useShinyOutput<T>(
  outputId: string,
  defaultValue?: T | undefined
): [T | undefined, boolean]
```

**Purpose**: Receives data FROM Shiny server TO React components.

**Parameters**:
- `outputId`: The Shiny output ID (set as `output$outputId` in R or `@render.type def outputId()` in Python)
- `defaultValue`: Optional default value before first server update

**Returns**: `[value, recalculating]` tuple where:
- `value`: Current value of the Shiny output (undefined until first update)
- `recalculating`: Boolean indicating if server is currently recalculating this output

**Example**: Various output types
```typescript
// Simple text output
const [textOutput] = useShinyOutput<string>("txtout", undefined);

// Complex JSON data (from 3-outputs example)
const [tableData] = useShinyOutput<Record<string, number[]>>("table_data", undefined);

// Statistics object
const [stats] = useShinyOutput<{
  colname: string;
  mean: number;
  median: number; 
  min: number;
  max: number;
}>("table_stats", undefined);

// With recalculating indicator
const [plotData, isRecalculating] = useShinyOutput<ImageData>("plot1", undefined);
```

### ImageOutput Component

```typescript
function ImageOutput({
  id,
  className
}: {
  id: string;
  className?: string;
}): JSX.Element
```

**Purpose**: Displays plot images from Shiny with automatic dimension tracking and progress indication.

**Features**:
- Automatically tracks image dimensions and sends to server via `.clientdata_output_${id}_width/height`
- Shows loading state while plots are being generated
- Handles image resize events with debounced dimension updates
- Supports opacity changes during recalculation

**Usage**:
```typescript
import { ImageOutput } from "shiny-react";

function PlotCard() {
  return (
    <div>
      <h2>My Plot</h2>
      <ImageOutput id="plot1" className="my-plot-styles" />
    </div>
  );
}
```

**Backend Requirements**:
```r
# R - Use renderPlot
output$plot1 <- renderPlot({
  # Your plotting code here
  plot(mtcars$wt, mtcars$mpg)
})
```

```python
# Python - Use render.plot  
@render.plot()
def plot1():
    fig, ax = plt.subplots()
    ax.scatter(mtcars["wt"], mtcars["mpg"])
    return fig
```

## Advanced Patterns and Examples

### Complex Data Structures (from 3-outputs example)

**Data Table with Dynamic Columns**:
```typescript
function DataTableCard() {
  const [tableData] = useShinyOutput<Record<string, number[]> | undefined>(
    "table_data", 
    undefined
  );

  // Extract column names dynamically from JSON structure
  const columnNames = tableData ? Object.keys(tableData) : [];
  const numRows = columnNames.length > 0 ? tableData![columnNames[0]].length : 0;

  return (
    <table>
      <thead>
        <tr>
          {columnNames.map(colName => (
            <th key={colName}>{colName.toUpperCase()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: numRows }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {columnNames.map(colName => {
              const value = tableData?.[colName][rowIndex];
              return (
                <td key={colName}>
                  {typeof value === "number" 
                    ? Number.isInteger(value) ? value : value.toFixed(3)
                    : value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Coordinated Multi-Output Dashboard**:
```typescript
function App() {
  return (
    <div className="dashboard">
      {/* Single input controls multiple outputs */}
      <SliderCard />           {/* useShinyInput for "table_rows" */}
      <StatisticsCard />       {/* useShinyOutput for "table_stats" */}  
      <DataTableCard />        {/* useShinyOutput for "table_data" */}
      <PlotCard />            {/* ImageOutput for "plot1" */}
    </div>
  );
}
```

### Custom Renderers for Complex Data

**R Backend - Custom renderObject**:
```r
# In utils.R
renderObject <- function(expr, env = parent.frame(), quoted = FALSE, outputArgs = list()) {
  func <- installExprFunction(expr, "func", env, quoted, label = "renderObject")
  createRenderFunction(
    func,
    function(value, session, name, ...) {
      value  # Return raw data as JSON
    },
    function(...) { stop("Not implemented") },
    outputArgs
  )
}

# In app.R
output$table_stats <- renderObject({
  mtcars_subset <- mtcars[seq_len(input$table_rows), ]
  list(
    colname = "mpg",
    mean = mean(mtcars_subset$mpg),
    median = median(mtcars_subset$mpg), 
    min = min(mtcars_subset$mpg),
    max = max(mtcars_subset$mpg)
  )
})
```

**Python Backend - Custom render_object**:
```python
# In utils.py
class render_object(Renderer[Jsonifiable]):
    """Reactively render arbitrary JSON object."""
    
    def __init__(self, _fn: Optional[ValueFn[str]] = None) -> None:
        super().__init__(_fn)
    
    async def transform(self, value: str) -> Jsonifiable:
        return value

# In app.py  
@render_object()
def table_stats():
    num_rows = input.table_rows()
    mtcars_subset = mtcars.head(num_rows)
    return {
        "colname": "mpg",
        "mean": float(mtcars_subset["mpg"].mean()),
        "median": float(mtcars_subset["mpg"].median()),
        "min": float(mtcars_subset["mpg"].min()), 
        "max": float(mtcars_subset["mpg"].max()),
    }
```

## Input Component Patterns

### Reusable Input/Output Card Pattern
```typescript
interface InputOutputCardProps {
  title: string;
  inputElement: React.ReactNode;
  outputValue: React.ReactNode;
}

function InputOutputCard({ title, inputElement, outputValue }: InputOutputCardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="input-output-container">
        <div className="input-group">{inputElement}</div>
        <div className="output-section">
          <div className="output-label">Server response:</div>
          <div className="output-content">{outputValue}</div>
        </div>
      </div>
    </div>
  );
}
```

### Button Input Pattern (Event Handling)
```typescript
function ButtonInputCard() {
  const [buttonCount, setButtonCount] = useShinyInput<number>("buttonin", 0);
  const buttonOut = useShinyOutput<string>("buttonout", undefined);

  const handleButtonClick = () => {
    setButtonCount(buttonCount + 1);  // Increment counter on each click
  };

  return (
    <InputOutputCard
      title="Button Input"
      inputElement={
        <div>
          <button onClick={handleButtonClick}>Click Me</button>
          <div>Button sends: {buttonCount}</div>
        </div>
      }
      outputValue={buttonOut}
    />
  );
}
```

### Date Input Pattern
```typescript
function DateInputCard() {
  // Default to today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [dateValue, setDateValue] = useShinyInput<string>("datein", today);
  const dateOut = useShinyOutput<string>("dateout", undefined);

  return (
    <InputOutputCard
      title="Date Input"
      inputElement={
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
        />
      }
      outputValue={dateOut}
    />
  );
}
```

### Radio Button Group Pattern
```typescript
function RadioInputCard() {
  const [radioValue, setRadioValue] = useShinyInput<string>("radioin", "option1");
  const radioOut = useShinyOutput<string>("radioout", undefined);

  return (
    <InputOutputCard
      title="Radio Button Input"
      inputElement={
        <div className="radio-group">
          {["option1", "option2", "option3"].map(option => (
            <label key={option}>
              <input
                type="radio"
                name="radio-options"
                value={option}
                checked={radioValue === option}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              {option}
            </label>
          ))}
        </div>
      }
      outputValue={radioOut}
    />
  );
}
```

## Backend Patterns and Best Practices

### R Shiny Patterns

**Basic Server Structure**:
```r
library(shiny)
source("utils.R", local = TRUE)

# UI with bare page (no default Shiny styling)
ui <- barePage(
  title = "My Shiny React App",
  tags$head(
    tags$script(src = "main.js", type = "module"),
    tags$link(href = "main.css", rel = "stylesheet")
  ),
  tags$div(id = "root")  # React mount point
)

server <- function(input, output, session) {
  # Text output - simple transformation
  output$txtout <- renderText({
    toupper(input$txtin)
  })
  
  # Complex data output using renderObject
  output$table_data <- renderObject({
    req(input$table_rows)  # Ensure input exists
    mtcars[seq_len(input$table_rows), ]
  })
  
  # Plot output
  output$plot1 <- renderPlot({
    req(input$table_rows)
    plot(mtcars$wt[1:input$table_rows], mtcars$mpg[1:input$table_rows])
  })
}

shinyApp(ui = ui, server = server)
```

**R Utility Functions (utils.R)**:
```r
# Bare page without default Shiny styling
barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}

# Custom renderer for arbitrary JSON data
renderObject <- function(expr, env = parent.frame(), quoted = FALSE, outputArgs = list()) {
  func <- installExprFunction(expr, "func", env, quoted, label = "renderObject")
  createRenderFunction(
    func,
    function(value, session, name, ...) { value },
    function(...) { stop("Not implemented") },
    outputArgs
  )
}
```

### Python Shiny Patterns

**Basic Server Structure**:
```python
from shiny import App, Inputs, Outputs, Session, ui, render
from utils import page_bare, render_object
from pathlib import Path

# UI with bare page
app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),  # React mount point
    title="My Shiny React App",
)

def server(input: Inputs, output: Outputs, session: Session):
    # Text output - simple transformation
    @render.text()
    def txtout():
        return input.txtin().upper()
    
    # Complex data output using render_object
    @render_object()
    def table_data():
        num_rows = input.table_rows()
        return mtcars.head(num_rows).to_dict(orient="list")
    
    # Plot output using matplotlib
    @render.plot()
    def plot1():
        num_rows = input.table_rows()
        fig, ax = plt.subplots()
        ax.scatter(mtcars["wt"].head(num_rows), mtcars["mpg"].head(num_rows))
        return fig

app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"))
```

**Python Utility Functions (utils.py)**:
```python
from shiny import ui
from shiny.html_dependencies import shiny_deps
from shiny.types import Jsonifiable
from shiny.render.renderer import Renderer

# Bare page without default Shiny styling
def page_bare(*args: ui.TagChild, title: str | None = None, lang: str = "en") -> ui.Tag:
    return ui.tags.html(
        ui.tags.head(ui.tags.title(title)),
        ui.tags.body(shiny_deps(False), *args),
        lang=lang,
    )

# Custom renderer for arbitrary JSON data
class render_object(Renderer[Jsonifiable]):
    """Reactively render arbitrary JSON object."""
    
    def __init__(self, _fn: Optional[ValueFn[str]] = None) -> None:
        super().__init__(_fn)
    
    async def transform(self, value: str) -> Jsonifiable:
        return value
```

## Technical Architecture Deep Dive

### ShinyReactRegistry System
The `ShinyReactRegistry` is the core coordination system that manages all input/output mappings:

```typescript
class ShinyReactRegistry {
  inputs: InputMap = {};    // Maps input IDs to React setter functions
  outputs: OutputMap = {};  // Maps output IDs to React setter functions
  
  // Registers React components that use a specific input ID
  registerInput(inputId: string, setValueFn: (value: any) => void) {
    if (!this.inputs[inputId]) {
      this.inputs[inputId] = {
        id: inputId,
        setValueFns: [],
        shinySetInputValueDebounced: debounce((value: any) => {
          window.Shiny.setInputValue!(inputId, value);
        }, 100)
      };
    }
    this.inputs[inputId].setValueFns.push(setValueFn);
  }
  
  // Registers React components that use a specific output ID  
  registerOutput(outputId: string, setValue: (value: any) => void, setRecalculating: (value: boolean) => void) {
    if (!this.outputs[outputId]) {
      // Creates hidden DOM element for Shiny output binding
      const div = document.createElement("div");
      div.className = "react-shiny-output";
      div.id = outputId;
      div.style.visibility = "hidden";
      document.body.appendChild(div);

      this.outputs[outputId] = {
        id: outputId,
        setValueFns: [],
        setRecalculatingFns: []
      };
    }
    this.outputs[outputId].setValueFns.push(setValue);
    this.outputs[outputId].setRecalculatingFns.push(setRecalculating);
  }
}
```

### Custom Output Binding
Shiny-React extends Shiny's output binding system:

```typescript
export class ReactOutputBinding extends window.Shiny.OutputBinding {
  // Finds all React output elements in the DOM
  override find(scope: HTMLElement | JQuery<HTMLElement>): JQuery<HTMLElement> {
    return $(scope).find(".react-shiny-output");
  }

  // Called when server sends new output value
  override renderValue(el: HTMLElement, data: any): void {
    window.Shiny.reactRegistry.outputs[el.id].setValueFns.forEach((fn) =>
      fn(data)  // Update all React components using this output ID
    );
  }

  // Called when server starts/stops recalculating
  override showProgress(el: HTMLElement, show: boolean): void {
    window.Shiny.reactRegistry.outputs[el.id].setRecalculatingFns.forEach(
      (fn) => fn(show)  // Update recalculating state in React components
    );
  }
}

// Register the custom output binding with Shiny
window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput"
);
```

### Initialization and Lifecycle
1. **React App Mounts**: Components using shiny-react hooks are created
2. **Hook Registration**: `useShinyInput` and `useShinyOutput` register with `ShinyReactRegistry`
3. **Shiny Initialization**: Waits for `window.Shiny.initializedPromise`  
4. **DOM Element Creation**: Hidden DOM elements created for output bindings
5. **WebSocket Connection**: Shiny establishes WebSocket for real-time communication
6. **Data Flow**: Input changes trigger debounced server updates, output changes trigger React re-renders

### Build System Architecture
- **TypeScript Compilation**: `tsc --emitDeclarationOnly` generates `.d.ts` files
- **ESBuild Bundling**: Creates both ESM (`.mjs`) and CommonJS (`.js`) bundles
- **Dual Output**: Separate builds for R and Python backends (different `www/` directories)  
- **External Dependencies**: React and React-DOM marked as external (provided by consuming app)
- **CSS Integration**: CSS automatically bundled into JavaScript files

### Communication Protocol
- **Input Updates**: React → Registry → Debounced → WebSocket → Shiny Server
- **Output Updates**: Shiny Server → WebSocket → Output Binding → Registry → React
- **Debouncing**: 100ms delay on input changes to prevent server overload
- **Deduplication**: Identical consecutive values are not sent to server
- **Error Handling**: Server errors captured and logged, don't crash React app

## Complete Troubleshooting Guide

### Development Issues

**Build Failures**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run watch  # Will show type errors in watch mode

# Manual build without watch
npm run build
```

**Shiny Connection Issues**:
```bash
# Verify Shiny server is running and accessible
curl http://localhost:8000

# Check Shiny logs for errors
# R: Look at R console output  
# Python: Look at terminal where shiny run is executed

# Try different port if 8000 is in use
R -e "shiny::runApp('r/app.R', port=8001)" 
shiny run py/app.py --port 8001
```

**Data Sync Issues**:
1. **Verify ID Matching**: Input/output IDs must be identical in React and Shiny
2. **Check Console Errors**: Browser DevTools → Console for JavaScript errors
3. **Monitor Network**: DevTools → Network → WebSocket for communication
4. **Verify Data Types**: Ensure TypeScript types match actual data from server

**Hot Reload Problems**:
```bash
# Restart watch mode
npm run watch

# Clear browser cache
# Open DevTools → Network → Disable cache checkbox

# Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
```

### TypeScript Issues

**Missing Type Definitions**:
```typescript
// Add explicit type annotations to useShinyInput/useShinyOutput
const [value, setValue] = useShinyInput<string>("my_input", "default");
const [output] = useShinyOutput<MyDataType>("my_output", undefined);

// Define custom interfaces for complex data
interface TableStats {
  colname: string;
  mean: number;
  median: number;
  min: number; 
  max: number;
}
const [stats] = useShinyOutput<TableStats>("table_stats", undefined);
```

**Import Errors**:
```typescript
// Correct imports for shiny-react
import { useShinyInput, useShinyOutput, ImageOutput } from "shiny-react";

// Verify package.json has correct dependency
// "dependencies": { "shiny-react": "file:../path/to/shiny-react" }
```

### Server-Side Debugging

**R Debugging**:
```r
# Add debug prints
server <- function(input, output, session) {
  output$my_output <- renderText({
    cat("Input value:", input$my_input, "\n")  # Debug print
    result <- toupper(input$my_input)
    cat("Output value:", result, "\n")
    result
  })
}

# Use req() to handle missing inputs
output$my_output <- renderText({
  req(input$my_input)  # Wait until input is available
  toupper(input$my_input)
})
```

**Python Debugging**:
```python  
def server(input, output, session):
    @render.text()
    def my_output():
        print(f"Input value: {input.my_input()}")  # Debug print
        result = input.my_input().upper()
        print(f"Output value: {result}")
        return result
```

### Performance Optimization

**Input Debouncing**:
```typescript
// Increase debounce delay for expensive operations
const [value, setValue] = useShinyInput<string>("expensive_input", "", { 
  debounceMs: 500  // Wait 500ms instead of default 200ms
});
```

**Conditional Rendering**:
```typescript
// Only render when data is available
function DataTable() {
  const [data] = useShinyOutput<any[]>("table_data", undefined);
  
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }
  
  return (
    <table>
      {/* Render table only when data exists */}
    </table>
  );
}
```

**Image Loading States**:
```typescript
function PlotCard() {
  return (
    <div>
      <h2>My Plot</h2>
      {/* ImageOutput automatically handles loading states */}
      <ImageOutput id="plot1" className="plot" />
    </div>
  );
}
```

This comprehensive documentation covers all aspects of Shiny-React development from basic concepts to advanced patterns and troubleshooting. Use it as a complete reference for building applications with React frontends and Shiny backends.