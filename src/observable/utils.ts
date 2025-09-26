import type { ObservableMetadata, ObservableValue, ObservablePlotOptions } from "./types";
import { getObservableModules } from "./reactor-observable";

/**
 * Checks if the Observable runtime is available
 */
export function isObservableAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as any).Observable?.Runtime
  );
}

/**
 * Checks if Observable Plot is available
 */
export function isObservablePlotAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).Plot;
}

/**
 * Gets metadata about the current Observable integration
 */
export function getObservableMetadata(): ObservableMetadata {
  const modules = getObservableModules();
  const activeModules = Array.from(modules.keys());
  const activeVariables: string[] = [];

  // In a real implementation, we would track variables more carefully
  // For now, we'll just return the module names

  return {
    isAvailable: isObservableAvailable(),
    version: isObservableAvailable() ? "1.0.0" : undefined, // Would get actual version
    activeModules,
    activeVariables,
  };
}

/**
 * Converts a Reactor value to an Observable-compatible value
 */
export function toObservableValue<T>(value: T): ObservableValue {
  // Most values can be passed directly
  // This function exists for future type conversions if needed
  return value as ObservableValue;
}

/**
 * Converts an Observable value to a type suitable for Reactor
 */
export function fromObservableValue<T>(value: ObservableValue): T {
  // Most values can be passed directly
  // This function exists for future type conversions if needed
  return value as T;
}

/**
 * Creates a default plot configuration based on data shape
 */
export function inferPlotOptions(data: any): ObservablePlotOptions {
  if (!data) {
    return { type: "auto" };
  }

  // If it's an array of objects, try to infer structure
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];

    if (typeof firstItem === "object" && firstItem !== null) {
      const keys = Object.keys(firstItem);

      // Look for common patterns
      const hasX = keys.includes("x");
      const hasY = keys.includes("y");
      const hasDate = keys.some(k => k.toLowerCase().includes("date") || k.toLowerCase().includes("time"));
      const hasValue = keys.includes("value");
      const hasCount = keys.includes("count");

      // Infer plot type based on data structure
      if (hasX && hasY) {
        // If x looks like time data, use line chart
        if (hasDate || (firstItem.x instanceof Date)) {
          return {
            type: "line",
            x: "x",
            y: "y",
          };
        }
        // Otherwise scatter plot
        return {
          type: "scatter",
          x: "x",
          y: "y",
        };
      }

      if (hasValue) {
        return {
          type: "histogram",
          x: "value",
        };
      }

      if (hasCount) {
        return {
          type: "bar",
          y: "count",
          x: keys.find(k => k !== "count"),
        };
      }

      // If we have numeric fields, default to line chart
      const numericFields = keys.filter(k => typeof firstItem[k] === "number");
      if (numericFields.length >= 2) {
        return {
          type: "line",
          x: keys[0],
          y: numericFields[0],
        };
      }
    }

    // If it's an array of numbers, create histogram
    if (typeof firstItem === "number") {
      return {
        type: "histogram",
      };
    }
  }

  // Default to auto mode
  return { type: "auto" };
}

/**
 * Creates a data transformer for Observable Plot
 */
export function createDataTransformer<T>(
  transform: (data: T) => any,
): (data: T) => ObservableValue {
  return (data: T) => {
    const transformed = transform(data);
    return toObservableValue(transformed);
  };
}

/**
 * Helper to load Observable runtime from CDN
 * This would typically be done in the application setup
 */
export async function loadObservableRuntime(): Promise<void> {
  if (isObservableAvailable()) {
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Observable runtime"));
    document.head.appendChild(script);
  });
}

/**
 * Helper to load Observable Plot from CDN
 */
export async function loadObservablePlot(): Promise<void> {
  if (isObservablePlotAvailable()) {
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/dist/plot.umd.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Observable Plot"));
    document.head.appendChild(script);
  });
}

/**
 * Helper function to create a simple Observable notebook-like container
 */
export function createObservableContainer(id: string, title?: string): HTMLElement {
  const container = document.createElement("div");
  container.id = id;
  container.className = "observable-container";
  container.style.cssText = `
    padding: 20px;
    margin: 20px 0;
    background: #f8f9fa;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  if (title) {
    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    `;
    container.appendChild(titleElement);
  }

  return container;
}

/**
 * Utility to format values for display in Observable
 */
export function formatObservableValue(value: any): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

/**
 * Creates a reactive derivation that combines multiple Reactor values
 * for use with Observable
 */
export function combineForObservable<T extends Record<string, any>>(
  values: T,
): ObservableValue {
  return toObservableValue(values);
}

/**
 * Utility to create Observable-compatible data tables
 */
export function createObservableTable(
  data: Array<Record<string, any>>,
  options?: {
    columns?: string[];
    sort?: string;
    reverse?: boolean;
    limit?: number;
  },
): any {
  let processedData = [...data];

  // Apply sorting
  if (options?.sort) {
    processedData.sort((a, b) => {
      const aVal = a[options.sort!];
      const bVal = b[options.sort!];
      if (aVal < bVal) return options?.reverse ? 1 : -1;
      if (aVal > bVal) return options?.reverse ? -1 : 1;
      return 0;
    });
  }

  // Apply limit
  if (options?.limit) {
    processedData = processedData.slice(0, options.limit);
  }

  // Filter columns if specified
  if (options?.columns) {
    processedData = processedData.map(row => {
      const filteredRow: Record<string, any> = {};
      for (const col of options.columns!) {
        if (col in row) {
          filteredRow[col] = row[col];
        }
      }
      return filteredRow;
    });
  }

  return processedData;
}