# shadcn/ui Integration Example

This example demonstrates how to set up and use **shadcn/ui** components with **shiny-react**. It shows the complete setup process, build configuration, and practical usage patterns for building modern, professionally-styled React applications with Shiny backends.

## What This Example Demonstrates

### shadcn/ui Setup
- **Project Configuration**: Complete setup with TypeScript path aliases, components.json, and Tailwind CSS
- **Build Integration**: Custom build script using esbuild with Tailwind CSS processing
- **Theme System**: CSS variables for light/dark modes and custom design tokens
- **Component Installation**: How to add and customize shadcn/ui components

### shiny-react Integration
- **Component Usage**: Real examples of shadcn/ui components with shiny-react hooks
- **Type Safety**: Full TypeScript integration between shadcn/ui and shiny-react
- **Event Handling**: Button interactions with proper event priority configuration
- **Form Controls**: Input components with bidirectional data binding

### Modern React Patterns  
- **Utility Functions**: The `cn()` helper for conditional class merging
- **Component Composition**: Building reusable card-based layouts
- **State Management**: Using shiny-react hooks within shadcn/ui components

## Directory Structure

```
5-shadcn/
├── package.json             # Dependencies including shadcn/ui packages
├── tsconfig.json            # TypeScript configuration with path aliases
├── components.json          # shadcn/ui CLI configuration  
├── build.ts                 # Custom build script with Tailwind processing
├── srcts/                   # React TypeScript source
│   ├── main.tsx             # Application entry point
│   ├── globals.css          # Global styles and CSS variables
│   ├── css.d.ts             # CSS module type definitions
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn helper)
│   └── components/
│       ├── ui/              # shadcn/ui base components
│       │   ├── card.tsx
│       │   ├── button.tsx
│       │   ├── badge.tsx
│       │   ├── input.tsx
│       │   └── separator.tsx
│       ├── App.tsx          # Main application component
│       ├── TextInputCard.tsx # Text input example with shadcn/ui
│       ├── ButtonEventCard.tsx # Button event example
│       └── PlotCard.tsx     # Plot display example
├── r/                       # R Shiny backend
│   ├── app.R                # Main R application
│   ├── shinyreact.R         # R functions for shiny-react
│   └── www/                 # Built assets (auto-generated)
└── py/                      # Python Shiny backend  
    ├── app.py               # Main Python application
    ├── shinyreact.py        # Python functions for shiny-react
    └── www/                 # Built assets (auto-generated)
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Frontend

```bash
# Build once
npm run build

# Or watch for changes during development
npm run watch
```

### 3. Run the Shiny Server

**Option A: R Backend**
```bash
R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"
```

**Option B: Python Backend**  
```bash
# Install Python dependencies first
pip install shiny pandas numpy

# Run the server
shiny run py/app.py --port 8000 --reload
```

### 4. Open Your Browser

Navigate to `http://localhost:8000` to see the shadcn/ui components in action.

## Key Components

### TextInputCard
Demonstrates text input handling with shadcn/ui components:
- **Input Component**: Uses shadcn/ui `Input` with proper styling
- **Card Layout**: Professional card-based layout with header and content
- **Badge Display**: Shows text length using shadcn/ui `Badge`
- **Real-time Updates**: Text processing and length calculation from server

### ButtonEventCard  
Shows event handling patterns with shadcn/ui buttons:
- **Button Component**: Uses shadcn/ui `Button` with variant styling
- **Event Priority**: Demonstrates proper button event configuration
- **Click Counter**: Server-side event tracking and display
- **State Management**: Button clicks trigger server updates

### PlotCard
Displays server-generated plots with shadcn/ui styling:
- **Image Output**: Shows how to integrate Shiny plots with shadcn/ui cards
- **Loading States**: Proper loading indicators during plot generation
- **Responsive Layout**: Plot adapts to card container dimensions

## Data Flow

```
React Components ──[useShinyInput]──> Shiny Server
                                          │
                                          ▼
                                   Process Data
                                          │
                                          ▼
React Components <──[useShinyOutput]── Shiny Server
```

### Input IDs
- `user_text`: Text input from the TextInputCard
- `button_click`: Button event from ButtonEventCard

### Output IDs  
- `processed_text`: Processed text (uppercase) from server
- `text_length`: Character count of input text
- `click_count`: Number of button clicks
- `plot1`: Generated plot image

## Setup Guide

### Adding New shadcn/ui Components

1. **Install Components**: Use the shadcn/ui CLI to add new components
   ```bash
   npx shadcn@latest add button card input badge separator
   # Or add all components
   npx shadcn@latest add --all
   ```

2. **Use in Components**: Import and use in your React components
   ```typescript
   import { Button } from "@/components/ui/button";
   import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
   ```

3. **Customize Styling**: Modify component files in `components/ui/` as needed

### Theme Customization

- **CSS Variables**: Modify theme colors and spacing in `globals.css`
- **Tailwind Config**: Adjust utility classes and responsive breakpoints
- **Component Variants**: Use built-in variants or add custom ones

### TypeScript Integration

- **Path Aliases**: Configured in `tsconfig.json` for clean imports (`@/components`, `@/lib`)
- **Type Safety**: Full TypeScript support for all shadcn/ui components
- **Hook Integration**: Use shiny-react hooks within shadcn/ui components seamlessly

## Development Tips

### Hot Reload Setup
Run these commands in separate terminals for the best development experience:

```bash
# Terminal 1: Build watcher
npm run watch

# Terminal 2: Shiny server with auto-reload
R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"
```

### Debugging
- **React**: Use browser DevTools Console and React DevTools
- **Shiny**: Check R/Python console for server logs
- **Data Flow**: Monitor Network tab for WebSocket communication
- **Performance**: Use React Profiler for component render analysis

### Common Issues
1. **Build Failures**: Ensure all npm dependencies are installed, especially `esbuild-plugin-tailwindcss`
2. **Path Alias Issues**: Verify TypeScript path mapping is correctly configured in `tsconfig.json`
3. **Styling Issues**: Check that Tailwind CSS is processing correctly in the build script
4. **shadcn/ui CLI Issues**: Make sure `components.json` is properly configured
5. **Import Errors**: Use the correct import paths with `@/` prefix for components

## Key Benefits

- **Professional Design**: Get beautiful, accessible components out of the box
- **Full Customization**: Components are copied to your project, not installed as dependencies
- **Modern Tooling**: Tailwind CSS, TypeScript, and modern build tools
- **Shiny Integration**: Seamless integration with shiny-react hooks
- **Development Experience**: Hot reload, type safety, and excellent DX

## Next Steps

This example provides a solid foundation for building sophisticated applications with shadcn/ui and shiny-react. You can:

1. **Add More Components**: Install additional shadcn/ui components as needed
2. **Customize Theme**: Modify the design system in `globals.css`
3. **Build Complex UIs**: Combine multiple components for rich user interfaces
4. **Integrate Backend Logic**: Add more complex server-side processing

For more advanced patterns and complete applications, see the other examples in this repository.
