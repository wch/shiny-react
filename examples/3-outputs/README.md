# Output Examples

This example demonstrates how to output complex data structures from Shiny applications using the shiny-react library.

- In R, it uses a `renderObject()` function, implemented in the `utils.R` file.
- In Python, it uses a `render_object()` function, implemented in the `utils.py` file.

These functions send arbitrary data structures (which can be converted to JSON) to the frontend, where they are displayed using React components.

## Directory Structure

- **`r/`** - R Shiny application
  - `app.R` - Main R Shiny server application
  - `utils.R` - R utility functions
- **`py/`** - Python Shiny application
  - `app.py` - Main Python Shiny server application
  - `utils.py` - Python utility functions
- **`srcts/`** - TypeScript/React source code
  - `main.tsx` - Entry point that renders the React app
  - `App.tsx` - Main App component that displays all examples
  - `Card.tsx` - Basic card component with title
  - Components:
    - `JsonTableCard.tsx` - Table data visualization with interactive slider and statistics display
  - `styles.css` - Styling for table display and statistics visualization
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

## Features Demonstrated

### JSON & Table Data (Primary Focus)

The main feature of this example is the **JsonTableCard** component, which demonstrates:

1. **Slider Control for Data Subsetting**: A range slider (1-32) that controls how many rows are displayed from the mtcars dataset
2. **Column-First JSON Data**: Server returns mtcars data in column-first format (e.g., `{mpg: [21.0, 21.0, ...], cyl: [6, 6, ...]}`)
3. **Statistics Visualization**: Server calculates and returns mpg statistics (mean, median, min, max) displayed as an interactive range visualization
4. **Real-time Updates**: As you move the slider, both the table data and statistics update automatically

The table displays the classic mtcars dataset with dynamic column extraction, showing all available columns (mpg, cyl, disp, hp, drat, wt, qsec, vs, am, gear, carb).

## Technical Implementation

### Data Flow
1. React slider component sends `table_rows` input to Shiny server
2. Server subsets mtcars dataset to the requested number of rows
3. Server returns JSON data via `table_data` (column-first format) and `table_stats` (mpg statistics) outputs
4. React component dynamically extracts column names and receives parsed JSON automatically
5. Data is rendered in a styled table with statistics range visualization

### Backend Implementation
- **R**: Uses `renderObject()` to serialize data frames directly to column-first format
- **Python**: Uses `render_object()` with pandas `.to_dict(orient="list")` for column-first format
- Both backends calculate mpg statistics (mean, median, min, max) for the range visualization

### Frontend Implementation
- Dynamic column extraction from JSON data structure
- Direct data reading without intermediate copying for performance
- Interactive statistics visualization with positioned mean and median indicators
- Full TypeScript type safety with `TableStats` interface

This example showcases that shiny-react outputs can handle complex, structured data seamlessly while maintaining performance and type safety.
