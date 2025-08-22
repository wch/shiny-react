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

The [examples/hello-world/](examples/hello-world/) directory contains a simple example demonstrating Shiny-React usage with both R and Python Shiny applications. The Shiny back end simply capitalizes the input value and sends it back to the front end.

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
  const outputValue = useShinyOutput<string>("my_output", undefined);

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
  output$my_output <- renderText({
    toupper(input$my_input)
  })
}
```

And the same thing in Python:

```python
def server(input, output, session):
    @render.text()
    def my_output():
        return input.my_input().upper()
```


Note that some other code is needed on the back end to create the complete Shiny app, but it is not shown here. See [examples/hello-world/r/app.R](examples/hello-world/r/app.R) and [examples/hello-world/py/app.py](examples/hello-world/py/app.py) for more complete examples.
