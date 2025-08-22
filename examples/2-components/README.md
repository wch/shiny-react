# Hello World Example

This is a simple example demonstrating how to use the shiny-react library to create React components that communicate with Shiny applications.

The front end is implemented with React and TypeScript. There are two versions of the Shiny back end: one is implemented with R, and the other with Python.

The front end uses `useShinyInput` and `useShinyOutput` hooks to send and receive values from the Shiny back end. The back end is a Shiny application that uses `renderText` (in R) or `render.text` (in Python) to render the output values. In this example, the Shiny back end simply capitalizes the input value and sends it back to the front end.

## Directory Structure

- **`r/`** - R Shiny application
  - `app.R` - Main R Shiny server application
  - `utils.R` - R utility functions
- **`py/`** - Python Shiny application
  - `app.py` - Main Python Shiny server application
  - `utils.py` - Python utility functions
- **`srcts/`** - TypeScript/React source code
  - `main.tsx` - Entry point that renders the React app
  - `HelloWorldComponent.tsx` - Main React component using shiny-react hooks
  - `styles.css` - Simple CSS styling for the application
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
