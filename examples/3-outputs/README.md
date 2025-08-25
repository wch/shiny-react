# Output Examples

This example demonstrates advanced output capabilities using the shiny-react library, showcasing how React components can receive and display complex data structures from Shiny applications.

The front end is implemented with React and TypeScript. There are two versions of the Shiny back end: one is implemented with R, and the other with Python.

The front end uses `useShinyInput` and `useShinyOutput` hooks to send and receive values from the Shiny back end. This example focuses on demonstrating that outputs can be complex data structures (JSON objects and arrays) rather than just simple strings, featuring an interactive table with dynamically controlled data generation.

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
  - `InputOutputCard.tsx` - Reusable card wrapper for input/output pairs
  - `Card.tsx` - Basic card component with title
  - Components:
    - `JsonTableCard.tsx` - **NEW**: Demonstrates JSON outputs and table data with slider control
    - `TextInputCard.tsx` - Text input (uppercased by server)
    - `NumberInputCard.tsx` - Number input with min/max/step
    - `CheckboxInputCard.tsx` - Boolean checkbox input
    - `RadioInputCard.tsx` - Radio button group selection
    - `SelectInputCard.tsx` - Dropdown select input
    - `SliderInputCard.tsx` - Range slider input
    - `DateInputCard.tsx` - HTML5 date picker input
    - `ButtonInputCard.tsx` - Button that sends incremental counter values
  - `styles.css` - Comprehensive CSS styling with responsive design and table styles
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

1. **Slider Control for Data Generation**: A range slider (1-20) that controls how many rows of data the server generates
2. **JSON Array Output**: Server returns an array of table data as JSON, parsed and displayed in a styled table
3. **JSON Object Output**: Server calculates and returns statistics (total rows, average age, average score) as a JSON object
4. **Real-time Updates**: As you move the slider, both the table data and statistics update automatically
5. **TypeScript Type Safety**: Full type safety for complex data structures (TableData interface)

The table displays sample data with columns: Name, Age, City, and Score. The server generates random data using seeded randomization for consistent results.

### Additional Input Components (Legacy Examples)

This example also includes the following input types for comparison:

1. **Text Input** - Basic text input that gets uppercased by the server
2. **Number Input** - Numeric input with range constraints (0-100)  
3. **Checkbox Input** - Boolean checkbox for true/false values
4. **Radio Button Input** - Single selection from multiple options
5. **Select Input** - Dropdown selection from a list of choices
6. **Slider Input** - Range slider for numeric values with visual feedback
7. **Date Input** - HTML5 date picker for date selection
8. **Button Input** - Click counter that increments on each button press

## Technical Implementation

### Data Flow
1. React slider component sends `table_rows` input to Shiny server
2. Server generates array of objects and calculates statistics
3. Server returns JSON data via `table_data` and `table_stats` outputs
4. React component receives and parses JSON automatically
5. Data is rendered in styled table and statistics cards

### Backend Implementation
- **R**: Uses `jsonlite::toJSON()` to serialize data frames and lists
- **Python**: Uses `json.dumps()` to serialize dictionaries and lists
- Both backends use seeded randomization for consistent data generation

This example showcases that shiny-react outputs are not limited to simple strings—they can handle complex data structures seamlessly.
