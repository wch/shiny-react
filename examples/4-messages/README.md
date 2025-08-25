# Event Messages Example

This example demonstrates **server-to-client one-way messaging** using Shiny's custom message system. It showcases how the server can push events to the client without waiting for user interaction.

The application displays toast notifications that appear in real-time as the server sends simulated log events. This pattern is useful for:

- Live notifications and alerts
- Activity feeds and status updates  
- Event-driven UI updates
- Real-time system monitoring
- Progress indicators for background tasks

## How it Works

### Frontend (React/TypeScript)
The React app registers a custom message handler using `window.Shiny.addCustomMessageHandler()`:

```typescript
window.Shiny.addCustomMessageHandler("logEvent", (msg) => {
  // Display toast notification with message and type
});
```

Toast messages automatically appear and disappear after 6 seconds, demonstrating pure event-driven communication.

### Backend (Shiny Server)
Both R and Python backends use reactive timers to simulate logging events:

**R version:**
```r
observe({
  invalidateLater(2000)
  session$sendCustomMessage("logEvent", log_event)
})
```

**Python version:**
```python
@reactive.effect
async def _():
    reactive.invalidate_later(2)
    await session.send_custom_message("logEvent", log_event)
```

The server sends random log messages every 2 seconds with different types (info, success, warning, error), each displayed as a color-coded toast notification.

## Directory Structure

- **`r/`** - R Shiny application
  - `app.R` - R Shiny server with reactive timer for log event simulation
  - `utils.R` - R utility functions (barePage)
- **`py/`** - Python Shiny application  
  - `app.py` - Python Shiny server with reactive timer for log event simulation
  - `utils.py` - Python utility functions (page_bare)
- **`srcts/`** - TypeScript/React source code
  - `main.tsx` - Entry point that renders the React app
  - `App.tsx` - Main React component with toast message handler
  - `styles.css` - Styling for the application and toast notifications
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

3. Run either the R or Python Shiny application:

   ```bash
   # For R
   R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"
   
   # For Python
   shiny run py/app.py --port 8000
   ```

4. Open your web browser and navigate to `http://localhost:8000`

You'll immediately see toast notifications appearing every 2 seconds in the top-right corner, demonstrating real-time server-to-client messaging. Each toast is color-coded by type:

- **Blue (info)**: General information messages
- **Green (success)**: Successful operations  
- **Yellow (warning)**: Warning messages
- **Red (error)**: Error notifications

The toasts automatically disappear after 6 seconds, showing the ephemeral nature of event-driven messages.

## Key Concepts Demonstrated

- **One-way messaging**: Server pushes events to client without client request
- **Custom message handlers**: React components can listen for specific message types
- **Reactive timers**: Server generates events on a schedule using `invalidateLater()` (R) or `reactive.invalidate_later()` (Python)
- **Event-driven UI**: Visual updates triggered by server events, not user interactions
- **Fire-and-forget communication**: No acknowledgment or response required from client
