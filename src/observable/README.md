# Observable Extension for Reactor

This directory contains an Observable extension for the Reactor system that enables seamless integration between Reactor values and Observable's reactive runtime for data visualization and computation.

## Overview

The Observable extension allows you to:

- Sync Reactor values with Observable variables
- Create reactive data visualizations using Observable Plot
- Build complex reactive computations using Observable's dependency graph
- Enable bidirectional data flow between React components and Observable notebooks
- Debug reactive state with Observable's inspector tools

## Quick Start

### Basic Usage

```typescript
import { useValue } from "../reactor";

// Create a Reactor value that syncs with Observable
const [data, setData] = useValue("myData", [], {
  notify: "observable",
  variableName: "chartData",
  autoPlot: true,
  plotOptions: { type: "line", x: "x", y: "y" }
});
```

### Advanced Configuration

```typescript
const [complexData, setComplexData] = useValue("complexData", [], {
  notify: "observable",
  variableName: "dataset",
  moduleName: "analytics",
  bidirectional: true,
  debounceMs: 200,
  autoPlot: true,
  plotOptions: {
    type: "scatter",
    x: "timestamp",
    y: "value",
    color: "category",
    width: 800,
    height: 400
  },
  inspector: true // Show debugging inspector
});
```

## Features

### 1. Reactive Data Synchronization

The extension automatically syncs Reactor values with Observable variables:

```typescript
// Any changes to the Reactor value will update the Observable variable
setData([
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 15 }
]);
```

### 2. Automatic Plot Generation

Enable `autoPlot` to automatically create Observable Plot visualizations:

```typescript
const [salesData, setSalesData] = useValue("sales", [], {
  notify: "observable",
  variableName: "salesMetrics",
  autoPlot: true,
  plotOptions: {
    type: "bar",
    x: "month",
    y: "revenue",
    color: "region"
  }
});
```

### 3. Bidirectional Binding

Enable two-way data flow between Reactor and Observable:

```typescript
const [sharedState, setSharedState] = useValue("shared", 0, {
  notify: "observable",
  variableName: "counter",
  bidirectional: true // Observable can update Reactor
});
```

### 4. Multiple Module Support

Organize your Observable variables into modules:

```typescript
// Dashboard module
const [dashboardData, setDashboardData] = useValue("data", [], {
  notify: "observable",
  moduleName: "dashboard",
  variableName: "mainChart"
});

// Analytics module
const [analyticsData, setAnalyticsData] = useValue("data", [], {
  notify: "observable",
  moduleName: "analytics",
  variableName: "report"
});
```

### 5. Debug Inspector

Enable the inspector for real-time debugging:

```typescript
const [debugData, setDebugData] = useValue("debug", {}, {
  notify: "observable",
  variableName: "debugState",
  inspector: true // Shows floating debug panel
});
```

## Setup Requirements

### 1. Install Observable Runtime

Add Observable runtime to your HTML or load it dynamically:

```html
<script src="https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js"></script>
```

Or load it programmatically:

```typescript
import { loadObservableRuntime } from "./utils";

await loadObservableRuntime();
```

### 2. Install Observable Plot (Optional)

For automatic plot generation:

```html
<script src="https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/dist/plot.umd.min.js"></script>
```

Or:

```typescript
import { loadObservablePlot } from "./utils";

await loadObservablePlot();
```

## Plot Types

The extension supports various plot types:

### Line Charts
```typescript
plotOptions: {
  type: "line",
  x: "date",
  y: "value",
  color: "series"
}
```

### Bar Charts
```typescript
plotOptions: {
  type: "bar",
  x: "category",
  y: "count"
}
```

### Scatter Plots
```typescript
plotOptions: {
  type: "scatter",
  x: "height",
  y: "weight",
  color: "gender"
}
```

### Histograms
```typescript
plotOptions: {
  type: "histogram",
  x: "value"
}
```

### Area Charts
```typescript
plotOptions: {
  type: "area",
  x: "time",
  y: "cumulative"
}
```

### Auto Detection
```typescript
plotOptions: {
  type: "auto" // Let Observable Plot choose the best visualization
}
```

## Utility Functions

### Data Transformation

```typescript
import { createDataTransformer, inferPlotOptions } from "./utils";

// Create a data transformer
const transformer = createDataTransformer((rawData) =>
  rawData.map(d => ({ x: d.timestamp, y: d.value }))
);

// Infer plot options from data structure
const options = inferPlotOptions(myData);
```

### Container Management

```typescript
import { createObservableContainer } from "./utils";

// Create a container for Observable content
const container = createObservableContainer("my-viz", "Sales Dashboard");
document.body.appendChild(container);
```

### Data Tables

```typescript
import { createObservableTable } from "./utils";

// Create an Observable-compatible data table
const table = createObservableTable(data, {
  columns: ["name", "value", "category"],
  sort: "value",
  reverse: true,
  limit: 100
});
```

## Integration Examples

### With Shiny + Observable

```typescript
// Triple integration: React ↔ Shiny ↔ Observable
const [data, setData] = useValue("analytics", [], {
  notify: ["shiny", "observable"],
  inputId: "analyticsData",
  variableName: "chartData",
  autoPlot: true
});
```

### Custom Observable Runtime

```typescript
import { Runtime } from "@observablehq/runtime";

const customRuntime = new Runtime();

const [data, setData] = useValue("custom", [], {
  notify: "observable",
  runtime: customRuntime,
  variableName: "myVariable"
});
```

### Real-time Data Streams

```typescript
// Stream data to Observable for real-time visualization
useEffect(() => {
  const interval = setInterval(() => {
    setLiveData(prev => [
      ...prev.slice(-99), // Keep last 100 points
      {
        timestamp: Date.now(),
        value: Math.random() * 100
      }
    ]);
  }, 1000);

  return () => clearInterval(interval);
}, []);

const [liveData, setLiveData] = useValue("stream", [], {
  notify: "observable",
  variableName: "liveChart",
  autoPlot: true,
  plotOptions: { type: "line", x: "timestamp", y: "value" },
  debounceMs: 0 // No debouncing for real-time updates
});
```

## API Reference

See [types.ts](./types.ts) for complete type definitions and [utils.ts](./utils.ts) for utility functions.

## Performance Notes

- **Debouncing**: Default debounce of 100ms prevents excessive updates
- **Module Cleanup**: Modules are automatically disposed when no longer needed
- **Memory Management**: Observers and variables are properly cleaned up on unmount
- **Batch Updates**: Multiple rapid updates are batched for efficiency

## Troubleshooting

### Observable Runtime Not Found
Ensure Observable runtime is loaded before using the extension:

```typescript
import { isObservableAvailable } from "./utils";

if (!isObservableAvailable()) {
  console.warn("Observable runtime not available");
}
```

### Plot Not Rendering
Check that Observable Plot is loaded and data is in the correct format:

```typescript
import { isObservablePlotAvailable, inferPlotOptions } from "./utils";

if (!isObservablePlotAvailable()) {
  console.warn("Observable Plot not available");
}

// Let the extension infer plot options
const options = inferPlotOptions(yourData);
```

### Inspector Not Showing
Ensure the inspector element is visible and not blocked by other elements:

```css
#observable-inspector-* {
  z-index: 10000 !important;
}
```