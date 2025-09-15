Shiny React (experimental!)
===========

React bindings library for Shiny applications, providing TypeScript/JavaScript hooks and components for bidirectional communication between React components and Shiny servers (both R and Python).

The library enables React components to send data to and receive data from Shiny server functions through custom hooks and output bindings.

## Quick Start

The easiest way to create a new Shiny-React application is to use [`create-shiny-react-app`](https://www.npmjs.com/package/create-shiny-react-app) to create a new app from a template:

```bash
# Create a new app in myapp/
npx create-shiny-react-app myapp
# You will be asked which template and which backend (R or Python) to use

cd myapp
npm install
npm run dev  # Builds frontend and starts Shiny app
```

The `npm run dev` command will build the frontend and start the Shiny app, and will automatically rebuild the frontend and reload the app when files change. By default it will use port 8000.

Open http://localhost:8000 in your browser to see your app.


You can change the port by setting the `PORT` environment variable:

```bash
PORT=8001 npm run dev
```


## Using Shiny-React with a Node.js project

To add shiny-react to an existing Node.js project, run:

```bash
npm install @posit/shiny-react
```

## Usage: basics

With Shiny-React, the front end is written in React, while the back end is written with Shiny in R or Python.

The front end sends values to the back end using the `useShinyInput` hook. This is similar to React's `useState` hook in that there is a state variable and a setter function, but the setter does an additional thing: it sends the value to the R/Python Shiny backend as a Shiny input value.

The back end sends data to the front end by setting Shiny output values just like in any other Shiny app. The front end reads output values with the `useShinyOutput` hook.

Here is an example of a React component for the front end:

```typescript
import { useShinyInput, useShinyOutput } from 'shiny-react';

function MyComponent() {
  // Input values sent to Shiny
  const [inputValue, setInputValue] = useShinyInput<string>("my_input", "default value");

  // Output values received from Shiny
  const [outputValue, outputRecalculating] = useShinyOutput<string>("my_output", undefined);

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <div>{outputValue}</div>
    </div>
  );
}
```

Here is a corresponding Shiny server function for the back end, written in R:

```r
function(input, output, session) {
  output$my_output <- render_json({
    toupper(input$my_input)
  })
}
```

And the same thing in Python:

```python
def server(input, output, session):
    @render_json
    def my_output():
        return input.my_input().upper()
```


## TypeScript/JavaScript API

### React Hooks

- **`useShinyInput<T>(id, defaultValue, options?)`** - Send data from React to Shiny server with debouncing and priority control
- **`useShinyOutput<T>(outputId, defaultValue?)`** - Receive reactive data from Shiny server outputs
- **`useShinyMessageHandler<T>(messageType, handler)`** - Handle custom messages sent from Shiny server with automatic cleanup
- **`useShinyInitialized()`** - Hook to determine when Shiny has finished initializing

### Components

- **`ImageOutput`** - Display Shiny image/plot outputs with automatic sizing

### Options

Input options support debouncing (`debounceMs`) and event priority (`priority`) for fine-grained control over server communication timing.



## R/Python API

### shinyreact.R and shinyreact.py

Each Shiny-React application includes a utility file that provides functions for React integration:

**shinyreact.R** (R backend):
- `page_react()` - Convenience function that creates a complete React page with JavaScript and CSS includes
- `render_json()` - Custom renderer for sending arbitrary JSON data to React components
- `post_message()` - Send messages to React components using `useShinyMessageHandler`

**shinyreact.py** (Python backend):
- `page_react()` - Convenience function that creates a complete React page with JavaScript and CSS includes
- `@render_json` - Custom renderer for sending arbitrary JSON data to React components
- `post_message()` - Send messages to React components using `useShinyMessageHandler`

### Sending Arbitrary JSON with `render_json`

`render_json` allows the R/Python code to send simple data types to the React frontend, such as strings and numbers. It also allows the R/Python code to send complex data structures and arbitrary JSON to React components, going beyond simple text or plot outputs.

**R Usage:**
```r
# Send a data frame (automatically converted to column-major JSON format)
output$table_data <- render_json({
  mtcars[1:input$num_rows, ]
})

# Send custom JSON objects
output$statistics <- render_json({
  list(
    mean = mean(mtcars$mpg),
    median = median(mtcars$mpg),
    min = min(mtcars$mpg),
    max = max(mtcars$mpg)
  )
})
```

**Python Usage:**
```python
# Send a data frame (explicitly converted to column-major JSON format)
@render_json
def table_data():
    num_rows = input.table_rows()
    return mtcars.head(num_rows).to_dict(orient="list")

# Send custom JSON objects
@render_json
def statistics():
    return {
        "mean": float(mtcars["mpg"].mean()),
        "median": float(mtcars["mpg"].median()),
        "min": float(mtcars["mpg"].min()),
        "max": float(mtcars["mpg"].max())
    }
```

**React Frontend:**
```typescript
// Receive complex data structures
const [tableData] = useShinyOutput<Record<string, number[]>>("table_data", undefined);
const [stats] = useShinyOutput<{mean: number; median: number; min: number; max: number}>("statistics", undefined);
```

**Data Frame Format:** Data frames are serialized in **column-major format** as JSON objects where each column becomes a property with an array of values:
```json
{
  "mpg": [21, 21, 22.8, 21.4, ...],
  "cyl": [6, 6, 4, 6, ...],
  "disp": [160, 160, 108, 258, ...]
}
```


## Examples

### Hello World Example

The [examples/1-hello-world/](examples/1-hello-world/) directory contains a simple example demonstrating basic Shiny-React usage with both R and Python Shiny applications. The Shiny back end simply capitalizes the input value and sends it back to the front end.

**View app in Shinylive: [R](https://wch.github.io/shiny-react/1-hello-world-r.html) | [Python](https://wch.github.io/shiny-react/1-hello-world-python.html)**

![Hello World Example](docs/1-hello-world.jpeg)

### Input Component Examples

The [examples/2-inputs/](examples/2-inputs/) directory showcases various input components and their integration with Shiny. This comprehensive example demonstrates:

- **Text Input** - Basic text input with server-side transformation
- **Number Input** - Numeric input with range constraints
- **Checkbox Input** - Boolean checkbox for true/false values
- **Radio Button Input** - Single selection from multiple options
- **Select Input** - Dropdown selection from a list of choices
- **Slider Input** - Range slider for numeric values with visual feedback
- **Date Input** - HTML5 date picker for date selection
- **Button Input** - Click counter demonstrating event handling

Each component follows consistent patterns and demonstrates real-time bidirectional communication between React and Shiny.

**View app in Shinylive: [R](https://wch.github.io/shiny-react/2-inputs-r.html) | [Python](https://wch.github.io/shiny-react/2-inputs-python.html)**

![Input Component Examples](docs/2-inputs.jpeg)

### Output Examples

The [examples/3-outputs/](examples/3-outputs/) directory demonstrates outputs that consist of arbitrary JSON data, as well as plot outputs.

**View app in Shinylive: [R](https://wch.github.io/shiny-react/3-outputs-r.html) | [Python](https://wch.github.io/shiny-react/3-outputs-python.html)**

![Output Examples](docs/3-outputs.jpeg)

### Server-to-Client Messages Example

The [examples/4-messages/](examples/4-messages/) directory showcases advanced server-to-client communication patterns using message handlers. This example demonstrates how Shiny servers can proactively send messages to React components for real-time notifications, status updates, and other server-initiated events.

Key features demonstrated:
- **Message Handlers** - Registering handlers for specific message types
- **Server-Initiated Communication** - Messages sent from server without user input
- **Real-time Updates** - Live notifications and status changes
- **Toast Notifications** - User-friendly message display system

**View app in Shinylive: [R](https://wch.github.io/shiny-react/4-messages-r.html) | [Python](https://wch.github.io/shiny-react/4-messages-python.html)**

![Server Messages Example](docs/4-messages.jpeg)

### Modern UI with shadcn/ui Components

The [examples/5-shadcn/](examples/5-shadcn/) directory demonstrates building modern, professional UIs using [shadcn/ui](https://ui.shadcn.com/) components with Tailwind CSS. This example shows how to integrate popular React component libraries with Shiny-React applications.

Key features demonstrated:
- **shadcn/ui Components** - Professional, accessible UI components
- **Tailwind CSS Integration** - Modern utility-first styling
- **Component Composition** - Building complex UIs from simple components
- **Theme System** - Customizable design tokens and styling
- **TypeScript Integration** - Full type safety with component props

**View app in Shinylive: [R](https://wch.github.io/shiny-react/5-shadcn-r.html) | [Python](https://wch.github.io/shiny-react/5-shadcn-python.html)**

![shadcn/ui Example](docs/5-shadcn.jpeg)

### Interactive Dashboard

The [examples/6-dashboard/](examples/6-dashboard/) directory presents a comprehensive dashboard application with charts, tables, and interactive data visualization. This sophisticated example demonstrates how to build data-driven applications with Shiny-React.

Key features demonstrated:
- **Interactive Charts** - Dynamic data visualization with filtering
- **Data Tables** - Sortable, filterable tabular data display
- **Multi-Component Communication** - Coordinated updates across multiple UI elements
- **Real-time Data** - Live updates from server calculations
- **Responsive Design** - Modern dashboard layout with shadcn/ui components
- **Advanced State Management** - Complex data flow patterns

**View app in Shinylive: [R](https://wch.github.io/shiny-react/6-dashboard-r.html) | [Python](https://wch.github.io/shiny-react/6-dashboard-python.html)**

![Dashboard Example](docs/6-dashboard.jpeg)

### AI Chat Application

The [examples/7-chat/](examples/7-chat/) directory showcases an advanced AI chat application with multi-modal input support, dynamic theming, and LLM integration. This production-ready example demonstrates sophisticated patterns for building modern conversational interfaces.

> **Note:** This example is not available to run in Shinylive because it requires packages that don't work in webR/Pyodide, and it needs an API key for LLM services. It must be run with regular Shiny instead of Shinylive.

Key features demonstrated:
- **Multi-modal Input** - Text and image attachments support
- **Streaming Responses** - Real-time AI response streaming
- **Dynamic Themes** - Multiple theme variants with live switching
- **File Upload** - Drag-and-drop image handling
- **LLM Integration** - Compatible with OpenAI API (R: ellmer, Python: chatlas)
- **Advanced UI Patterns** - Professional chat interface with shadcn/ui
- **Custom Message Handlers** - Server-initiated streaming communication

![AI Chat Example](docs/7-chat.jpeg)

