Shiny React (experimental!)
===========

React bindings library for Shiny applications, providing TypeScript/JavaScript hooks and components for bidirectional communication between React components and Shiny servers (both R and Python).

The library enables React components to send data to and receive data from Shiny server functions through custom hooks and output bindings.

## Installation

Note that this library is not yet available on npm. It must be built from source for now.


## Building the Library

```bash
# Install dependencies
npm install

# Build the library
npm run build
# Or for development with watch mode
npm run watch
```

## Architecture

### Core Components

- **`useShinyInput<T>()`** - Hook to send data from React to Shiny server
- **`useShinyOutput<T>()`** - Hook to receive data from Shiny server
- **`ShinyReactRegistry`** - Global registry managing input/output mappings and debounced updates
- **`ReactOutputBinding`** - Custom Shiny output binding class for React components

### Key Features

1. **Promise-based Initialization**: Components wait for `window.Shiny.initializedPromise` before establishing connections
2. **Debounced Updates**: Input changes are debounced (100ms) before sending to Shiny server
3. **Dual Package Support**: Compatible with both CommonJS (`require()`) and ESM (`import`) module systems
4. **TypeScript Support**: Full TypeScript declarations included

## Hello World Example

The `examples/hello-world/` directory contains a complete example demonstrating the library usage with both R and Python Shiny applications.

![Hello World Example](docs/hello-world-screenshot.jpg)

To use it, first build the shiny-react library using the instructions above.

### Running the Hello World Example

Build the JavaScript and CSS for the React application:

```bash
cd examples/hello-world

# Install dependencies
npm install

# Build the React application
npm run build
# Or for development with watch mode
npm run watch
```

In another terminal, run either the R or Python Shiny application:

```bash
# For R
R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"

# For Python
shiny run py/app.py --port 8000
```

Open your browser to `http://localhost:8000`


## Usage

```typescript
import { useShinyInput, useShinyOutput } from 'shiny-react';

function MyComponent() {
  // Send data to Shiny
  const [inputValue, setInputValue] = useShinyInput<string>("myInput", "default");

  // Receive data from Shiny
  const outputValue = useShinyOutput<string>("myOutput", undefined);

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
