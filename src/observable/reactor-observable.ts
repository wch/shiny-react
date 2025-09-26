import type { Reactor } from "../reactor";
import { registerExtension } from "../reactor/extensions/registry";
import type { Extension, ExtensionFactory } from "../reactor/extensions/types";
import { createDebouncedFn, type DebouncedFunction } from "../utils";
import type {
  ObservableOptions,
  ObservableModule,
  ObservableVariable,
  ObservableObserver,
} from "./types";

const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Global registry of Observable modules
 */
const observableModules = new Map<string, ObservableModule>();

/**
 * Get or create an Observable runtime instance
 */
function getObservableRuntime(): any {
  // Check if Observable runtime is already loaded
  if (typeof window !== "undefined" && (window as any).Observable?.Runtime) {
    return (window as any).Observable.Runtime;
  }

  // In a real implementation, you would load the Observable runtime here
  // For now, we'll return a mock that can be replaced with the real runtime
  console.warn(
    "Observable runtime not found. Install @observablehq/runtime to enable Observable integration.",
  );
  return null;
}

/**
 * Extension that syncs a Reactor value with an Observable variable
 */
class ObservableExtension<T> implements Extension<T> {
  readonly name = "observable";
  private debouncedUpdateObservable: DebouncedFunction<(value: T) => void>;
  private module?: ObservableModule;
  private variable?: ObservableVariable;
  private cleanupFn?: () => void;
  private observer?: ObservableObserver;
  private Runtime: any;

  constructor(
    private value: Reactor<T>,
    private options: ObservableOptions,
  ) {
    // Create debounced function for updating Observable
    this.debouncedUpdateObservable = createDebouncedFn(
      this.updateObservable.bind(this),
      this.options.debounceMs ?? DEFAULT_DEBOUNCE_MS,
    );

    // Get or use provided runtime
    this.Runtime = this.options.runtime || getObservableRuntime();
  }

  /**
   * Updates the Observable variable with the current Reactor value
   */
  private updateObservable(value: T): void {
    if (!this.variable || !this.module) {
      return;
    }

    try {
      // Redefine the variable with the new value
      this.variable.define(this.options.variableName, value);

      // If autoPlot is enabled, update the plot
      if (this.options.autoPlot && this.options.plotOptions) {
        this.updatePlot(value);
      }
    } catch (error) {
      console.error("Failed to update Observable variable:", error);
    }
  }

  /**
   * Updates the Observable Plot visualization
   */
  private updatePlot(value: T): void {
    if (!this.module) return;

    const plotOptions = this.options.plotOptions;
    const plotName = `${this.options.variableName}_plot`;

    // Check if Observable Plot is available
    if (typeof window !== "undefined" && (window as any).Plot) {
      const Plot = (window as any).Plot;

      try {
        // Create a plot based on the data and options
        let plot;
        const data = Array.isArray(value) ? value : [value];

        switch (plotOptions?.type) {
          case "line":
            plot = Plot.line(data, {
              x: plotOptions.x,
              y: plotOptions.y,
              stroke: plotOptions.color,
              ...plotOptions,
            });
            break;

          case "bar":
            plot = Plot.barY(data, {
              x: plotOptions.x,
              y: plotOptions.y,
              fill: plotOptions.color,
              ...plotOptions,
            });
            break;

          case "scatter":
            plot = Plot.dot(data, {
              x: plotOptions.x,
              y: plotOptions.y,
              fill: plotOptions.color,
              ...plotOptions,
            });
            break;

          case "histogram":
            plot = Plot.histogram(data, {
              value: plotOptions.x || plotOptions.y,
              ...plotOptions,
            });
            break;

          case "area":
            plot = Plot.area(data, {
              x: plotOptions.x,
              y: plotOptions.y,
              fill: plotOptions.color,
              ...plotOptions,
            });
            break;

          default:
            // Auto mode - let Plot decide
            plot = Plot.auto(data, plotOptions);
        }

        // Define a variable for the plot
        this.module.define(plotName, plot);
      } catch (error) {
        console.error("Failed to create Observable Plot:", error);
      }
    }
  }

  /**
   * Sets up bidirectional binding between Reactor and Observable
   */
  private setupBidirectionalBinding(): void {
    if (!this.options.bidirectional || !this.module) {
      return;
    }

    // Create an observer that updates the Reactor when Observable changes
    this.observer = {
      fulfilled: (observableValue: any) => {
        // Avoid infinite loops by checking if the value actually changed
        const currentReactorValue = this.value.getValue();
        if (observableValue !== currentReactorValue) {
          // Update the Reactor value
          this.value.setValue(observableValue);
        }
      },
      rejected: (error: Error) => {
        console.error("Observable variable computation failed:", error);
      },
    };

    // Create a separate variable to observe changes
    const watcherName = `${this.options.variableName}_watcher`;
    this.module
      .variable(this.observer)
      .define(watcherName, [this.options.variableName], (val: any) => val);
  }

  /**
   * Creates an inspector for debugging if requested
   */
  private createInspector(): void {
    if (!this.options.inspector || !this.module || !this.Runtime) {
      return;
    }

    try {
      // Check if Inspector is available
      const Inspector = this.Runtime.Inspector;
      if (Inspector) {
        // Create a container for the inspector
        const container = document.createElement("div");
        container.id = `observable-inspector-${this.options.variableName}`;
        container.style.cssText = `
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: white;
          border: 1px solid #ccc;
          padding: 10px;
          max-width: 400px;
          max-height: 300px;
          overflow: auto;
          z-index: 9999;
          font-family: monospace;
          font-size: 12px;
        `;
        document.body.appendChild(container);

        // Attach inspector to the variable
        const inspector = Inspector.into(container);
        this.module.variable(inspector()).define(
          `${this.options.variableName}_inspector`,
          [this.options.variableName],
          (val: any) => val,
        );
      }
    } catch (error) {
      console.error("Failed to create Observable inspector:", error);
    }
  }

  attach(value: Reactor<T>): () => void {
    if (!this.Runtime) {
      console.warn("Observable runtime not available");
      return () => {};
    }

    try {
      // Create or get the module
      const moduleName = this.options.moduleName || "default";
      if (!observableModules.has(moduleName)) {
        const runtime = new this.Runtime();
        const module = runtime.module();
        observableModules.set(moduleName, module);
      }
      this.module = observableModules.get(moduleName);

      // Create the Observable variable
      this.variable = this.module!.variable();

      // Define the initial value
      const initialValue = value.getValue();
      this.variable.define(this.options.variableName, initialValue);

      // Set up bidirectional binding if requested
      this.setupBidirectionalBinding();

      // Create inspector if requested
      this.createInspector();

      // Add the update hook to sync Reactor changes to Observable
      value.addUpdateHook(this.debouncedUpdateObservable);

      // Create cleanup function
      this.cleanupFn = () => {
        value.removeUpdateHook(this.debouncedUpdateObservable);
        this.debouncedUpdateObservable.cancel();

        // Clean up Observable resources
        if (this.variable) {
          this.variable.delete();
        }

        // Remove inspector if it exists
        if (this.options.inspector) {
          const inspectorElement = document.getElementById(
            `observable-inspector-${this.options.variableName}`,
          );
          if (inspectorElement) {
            inspectorElement.remove();
          }
        }
      };

      return this.cleanupFn;
    } catch (error) {
      console.error("Failed to attach Observable extension:", error);
      return () => {};
    }
  }

  /**
   * Updates the debounce delay
   */
  updateDebounceDelay(debounceMs: number): void {
    this.debouncedUpdateObservable.setDelay(debounceMs);
  }

  /**
   * Gets the current debounce delay
   */
  getDebounceDelay(): number {
    return this.debouncedUpdateObservable.getDelay();
  }

  /**
   * Gets the variable name
   */
  getVariableName(): string {
    return this.options.variableName;
  }

  /**
   * Gets the module name
   */
  getModuleName(): string {
    return this.options.moduleName || "default";
  }

  /**
   * Checks if bidirectional binding is enabled
   */
  isBidirectional(): boolean {
    return this.options.bidirectional || false;
  }

  /**
   * Gets the Observable module instance
   */
  getModule(): ObservableModule | undefined {
    return this.module;
  }

  /**
   * Gets the Observable variable instance
   */
  getVariable(): ObservableVariable | undefined {
    return this.variable;
  }
}

/**
 * Factory function for creating Observable extensions
 */
export const createObservableExtension: ExtensionFactory<any, ObservableOptions> = <T>(
  value: Reactor<T>,
  options: ObservableOptions,
) => {
  return new ObservableExtension(value, options);
};

// Auto-register the observable extension
registerExtension("observable", createObservableExtension);

/**
 * Gets all active Observable modules
 */
export function getObservableModules(): Map<string, ObservableModule> {
  return observableModules;
}

/**
 * Disposes a specific Observable module
 */
export function disposeObservableModule(name: string): boolean {
  const module = observableModules.get(name);
  if (module) {
    module.dispose();
    observableModules.delete(name);
    return true;
  }
  return false;
}

/**
 * Disposes all Observable modules
 */
export function disposeAllObservableModules(): void {
  for (const [name, module] of observableModules) {
    module.dispose();
  }
  observableModules.clear();
}