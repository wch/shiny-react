# Output Examples

This example demonstrates how to output complex data structures from Shiny applications using the shiny-react library.

- In R, it uses a `render_object()` function, implemented in the `shinyreact.R` file.
- In Python, it uses a `render_object` function, implemented in the `shinyreact.py` file.

These functions send arbitrary data structures (which can be converted to JSON) to the frontend, where they are displayed using React components.

## Directory Structure

- **`r/`** - R Shiny application
  - `app.R` - Main R Shiny server application
  - `shinyreact.R` - R utility functions
- **`py/`** - Python Shiny application
  - `app.py` - Main Python Shiny server application
  - `shinyreact.py` - Python utility functions
- **`srcts/`** - TypeScript/React source code
  - `main.tsx` - Entry point that renders the React app
  - `App.tsx` - Main App component that displays all examples
  - `Card.tsx` - Basic card component with title
  - Components:
    - `SliderCard.tsx` - Interactive slider control for data subsetting
    - `DataTableCard.tsx` - Table display of mtcars dataset
    - `StatisticsCard.tsx` - MPG statistics visualization with range indicators
    - `PlotCard.tsx` - Scatter plot visualization using ImageOutput component
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

### Multiple Output Types (Primary Focus)

This example demonstrates multiple coordinated output types across separate cards:

1. **Data Control Card**: Interactive slider (1-32) that controls how many rows to load from the mtcars dataset
2. **Statistics Card**: MPG statistics (mean, median, min, max) with visual range indicators and positioned dots
3. **Data Table Card**: Column-first JSON data displayed as a styled table with dynamic column extraction
4. **Plot Card**: Scatter plot visualization (MPG vs Weight) with trend line using ImageOutput component
5. **Real-time Coordination**: All four cards update automatically when the slider changes, demonstrating reactive data flow

Each card displays a different output type while remaining synchronized through the shared `table_rows` input. The example showcases JSON objects, structured data, and image outputs working together.

## Technical Implementation

### Data Flow
1. **SliderCard** sends `table_rows` input to Shiny server
2. Server subsets mtcars dataset to the requested number of rows  
3. Server returns three different output types:
   - `table_data`: Column-first JSON format for the table
   - `table_stats`: MPG statistics object for range visualization
   - `plot1`: Rendered plot image for scatter plot display
4. Each card component receives and displays its respective output type
5. All cards update reactively when the slider input changes

### Backend Implementation
- **R**: Uses `render_object()` for JSON data and `renderPlot()` for plot generation
- **Python**: Uses `render_object` for JSON data and `render.plot()` with matplotlib for plots  
- Both backends calculate mpg statistics (mean, median, min, max) for the range visualization
- Plot generation creates MPG vs Weight scatter plots with trend lines

### Frontend Implementation
- **Modular Card Architecture**: Each output type is isolated in its own card component
- **Dynamic Column Extraction**: Table card reads JSON structure and extracts column names automatically
- **ImageOutput Component**: Custom component for displaying plot images from Shiny
- **Reactive Coordination**: All four cards respond to the same input control
- **TypeScript Type Safety**: Full type safety with proper interfaces for complex data structures

### Component Breakdown
- **SliderCard**: Uses `useShinyInput` to send data control values
- **DataTableCard**: Uses `useShinyOutput` to receive and display table data
- **StatisticsCard**: Uses `useShinyOutput` to receive stats and render range visualization
- **PlotCard**: Uses `ImageOutput` component to display server-generated plots

This example demonstrates shiny-react's ability to coordinate multiple output types across separate UI components while maintaining clean separation of concerns and reactive data flow.
