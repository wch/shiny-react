Shiny React (experimental!)
===========

React bindings library for Shiny applications, providing TypeScript/JavaScript hooks and components for bidirectional communication between React components and Shiny servers (both R and Python).

The library enables React components to send data to and receive data from Shiny server functions through custom hooks and output bindings.

## Installation

Note that this library is not yet available on npm. It must be built from source for now.


## Building the Library

Install dependencies:
```bash
npm install
```

Build the library:
```bash
npm run build
```

For development with watch mode:
```bash
npm run watch
```

For production builds:
```bash
npm run build-prod
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

1. Navigate to the example directory:
   ```bash
   cd examples/hello-world
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the React application:
   ```bash
   npm run build
   # Or for development with watch mode:
   npm run watch
   ```

4. Run either the R or Python Shiny application:
   ```bash
   # For R
   R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"

   # For Python
   shiny run py/app.py --port 8000
   ```

5. Open your browser to `http://localhost:8000`

The example demonstrates:
- Sending data from React to Shiny using `useShinyInput`
- Receiving data from Shiny in React using `useShinyOutput`
- Real-time bidirectional communication between React and Shiny

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
