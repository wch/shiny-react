# Input Examples

This example demonstrates various input components using the shiny-react library, showcasing different ways to create React components that communicate with Shiny applications.

The front end is implemented with React and TypeScript. There are two versions of the Shiny back end: one is implemented with R, and the other with Python.

The front end uses `useShinyInput` and `useShinyOutput` hooks to send and receive values from the Shiny back end. Each component demonstrates a different input type, with the Shiny back end echoing back the received values (with minimal transformation).

## Directory Structure

- **`r/`** - R Shiny application
  - `app.R` - Main R Shiny server application
  - `utils.R` - R utility functions
- **`py/`** - Python Shiny application
  - `app.py` - Main Python Shiny server application
  - `utils.py` - Python utility functions
- **`srcts/`** - TypeScript/React source code
  - `main.tsx` - Entry point that renders the React app
  - `App.tsx` - Main App component that displays all input examples
  - `InputOutputCard.tsx` - Reusable card wrapper for input/output pairs
  - `Card.tsx` - Basic card component with title
  - Input components:
    - `TextInputCard.tsx` - Text input (uppercased by server)
    - `NumberInputCard.tsx` - Number input with min/max/step
    - `CheckboxInputCard.tsx` - Boolean checkbox input
    - `RadioInputCard.tsx` - Radio button group selection
    - `SelectInputCard.tsx` - Dropdown select input
    - `SliderInputCard.tsx` - Range slider input
    - `DateInputCard.tsx` - HTML5 date picker input
    - `ButtonInputCard.tsx` - Button that sends incremental counter values
  - `styles.css` - Comprehensive CSS styling with responsive design
- **`r/www/`** - Built JavaScript output for R Shiny app (generated)
- **`py/www/`** - Built JavaScript output for Python Shiny app (generated)
- **`node_modules/`** - npm dependencies (generated)

## Building

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the React application:
   ```bash
   npm run build
   ```

   The build process compiles the TypeScript React code and CSS into JavaScript bundles output directly to `r/www/main.js` and `py/www/main.js`. The CSS is automatically bundled into the JavaScript files.

   Or for development with watch mode:
   ```bash
   npm run watch
   ```

   The watch mode runs three processes concurrently:
   - TypeScript type checking in watch mode
   - ESBuild bundling for R app (outputs to `r/www/main.js`)
   - ESBuild bundling for Python app (outputs to `py/www/main.js`)

   Note that if you build just an R or Python Shiny application (instead of both, as in this example), then you can simplify the `build` and `watch` scripts in `package.json` to only target one output directory.

3. Run either the R or Python Shiny application:

   ```bash
   # For R
   R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"
   
   # For Python
   shiny run py/app.py --port 8000
   ```

   The commands above use port 8000, but you can use a different port.

4. Open your web browser and navigate to `http://localhost:8000` to see the Shiny-React application in action.

## Input Components Demonstrated

This example showcases eight different input types and how they integrate with Shiny:

1. **Text Input** - Basic text input that gets uppercased by the server
2. **Number Input** - Numeric input with range constraints (0-100)
3. **Checkbox Input** - Boolean checkbox for true/false values
4. **Radio Button Input** - Single selection from multiple options
5. **Select Input** - Dropdown selection from a list of choices
6. **Slider Input** - Range slider for numeric values with visual feedback
7. **Date Input** - HTML5 date picker for date selection
8. **Button Input** - Click counter that increments on each button press

Each component follows the same pattern:
- Uses `useShinyInput` to send data to Shiny server
- Uses `useShinyOutput` to receive processed data back from server
- Displays both the input value and server response side by side
- Demonstrates real-time bidirectional communication
