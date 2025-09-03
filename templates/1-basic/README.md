# Hello World - Basic Template

This is a basic template example demonstrating how to use the shiny-react library to create React components that communicate with Shiny applications.

The front end is implemented with React and TypeScript. The Shiny backend can be implemented in either R or Python (or both). Depending on which language(s) you selected when creating this app, you may have an `r/` directory, a `py/` directory, or both.

The front end uses `useShinyInput` and `useShinyOutput` hooks to send and receive values from the Shiny back end. The back end is a Shiny application that uses `renderText` (in R) or `render.text` (in Python) to render the output values. In this example, the Shiny back end simply capitalizes the input value and sends it back to the front end.

## Directory Structure

- **`r/`** - R Shiny application (if you selected R)
  - `app.R` - Main R Shiny server application
  - `shinyreact.R` - R utility functions
- **`py/`** - Python Shiny application (if you selected Python)
  - `app.py` - Main Python Shiny server application
  - `shinyreact.py` - Python utility functions
- **`srcts/`** - TypeScript/React source code
  - `main.tsx` - Entry point that renders the React app
  - `HelloWorldComponent.tsx` - Main React component using shiny-react hooks
  - `styles.css` - Simple CSS styling for the application
- **`r/www/`** - Built JavaScript output for R Shiny app (generated)
- **`py/www/`** - Built JavaScript output for Python Shiny app (generated)
- **`node_modules/`** - npm dependencies (generated)

## Building

```bash
# Install dependencies
npm install

# Build the JS/CSS files
npm run build

# OR, watch files for changes and automatically rebuild
npm run watch
```

The build process compiles the TypeScript React code and CSS into JavaScript bundles output directly to `r/www/main.js` and/or `py/www/main.js`.


The watch mode runs three processes concurrently:
   - TypeScript type checking in watch mode
   - ESBuild bundling for R app (outputs to `r/www/main.js`)
   - ESBuild bundling for Python app (outputs to `py/www/main.js`)

In a separate terminal, run either the R or Python Shiny application:

```bash
# For R (if you have an r/ directory)
R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"

# For Python (if you have a py/ directory)
shiny run py/app.py --port 8000 --reload
```

The commands above use port 8000, but you can use a different port.

Now you can open your web browser and navigate to `http://localhost:8000` to see the Shiny-React application in action.
