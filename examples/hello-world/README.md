# Hello World Example

This is a simple example demonstrating how to use the shiny-react library to create React components that communicate with Shiny applications.

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
- **`dist/`** - Intermediate build directory (generated)
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

   The build process compiles the TypeScript React code into a single JavaScript bundle in `dist/main.js` and copies it to both `r/www/main.js` and `py/www/main.js`.

   Or for development with watch mode:
   ```bash
   npm run watch
   ```

   The watch mode runs three processes concurrently:
   - TypeScript type checking in watch mode
   - ESBuild bundling in watch mode (outputs to `dist/main.js`)
   - Chokidar file watcher that automatically copies `dist/main.js` to both `r/www/` and `py/www/` whenever it changes


   Note that if you build just an R or Python Shiny application (instead of both, as in this example), then you can simplify the `build` and `watch` scripts in `package.json`. Instead of writing to `dist/main.js`, you can output the file directly to `r/www/main.js` or `py/www/main.js`, and you don't need to use the `chokidar` tool to copy the file.

3. Run either the R or Python Shiny application:

   ```bash
   # For R
   R -e "shiny::runApp('r/app.R', port=8000)"
   
   # For Python
   shiny run py/app.py --port 8000
   ```

   The command above uses port 8000, but you can use any port you like.

4. Open your web browser and navigate to `http://localhost:8000` to see the Shiny-React application in action.
