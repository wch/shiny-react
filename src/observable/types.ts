/**
 * Types for Observable extension integration
 */

/**
 * Configuration options for the Observable extension
 */
export interface ObservableOptions {
  /** The module name in the Observable runtime */
  moduleName?: string;

  /** The variable name to bind in Observable */
  variableName: string;

  /** Whether to create bidirectional binding (Observable can update Reactor) */
  bidirectional?: boolean;

  /** Debounce delay in milliseconds for updates to Observable (default: 100) */
  debounceMs?: number;

  /** Whether to auto-create an Observable Plot visualization */
  autoPlot?: boolean;

  /** Configuration for Observable Plot if autoPlot is true */
  plotOptions?: ObservablePlotOptions;

  /** Custom Observable runtime instance to use */
  runtime?: any;

  /** Whether to create an inspector for debugging */
  inspector?: boolean;
}

/**
 * Options for configuring Observable Plot visualizations
 */
export interface ObservablePlotOptions {
  /** Type of plot (e.g., "line", "bar", "scatter", "histogram") */
  type?: "line" | "bar" | "scatter" | "histogram" | "area" | "auto";

  /** X-axis field name for data objects */
  x?: string;

  /** Y-axis field name for data objects */
  y?: string;

  /** Color field name for data objects */
  color?: string;

  /** Width of the plot in pixels */
  width?: number;

  /** Height of the plot in pixels */
  height?: number;

  /** Custom marks or plot configuration */
  marks?: any[];

  /** Additional plot options */
  [key: string]: any;
}

/**
 * Observer interface for Observable variables
 */
export interface ObservableObserver {
  /** Called when a variable computation starts */
  pending?: () => void;

  /** Called when a variable updates successfully */
  fulfilled?: (value: any) => void;

  /** Called when a variable computation fails */
  rejected?: (error: Error) => void;
}

/**
 * Represents an Observable module instance
 */
export interface ObservableModule {
  /** Define a variable in the module */
  define(name: string | null, inputs: string[], definition: Function): ObservableVariable;
  define(name: string | null, definition: any): ObservableVariable;

  /** Get a variable from the module */
  variable(observer?: ObservableObserver): ObservableVariable;

  /** Import variables from another module */
  import(name: string, alias?: string, module?: ObservableModule): void;

  /** Dispose of the module */
  dispose(): void;
}

/**
 * Represents an Observable variable
 */
export interface ObservableVariable {
  /** Define the variable's computation */
  define(name: string | null, inputs: string[], definition: Function): ObservableVariable;
  define(name: string | null, definition: any): ObservableVariable;

  /** Import a variable from another module */
  import(name: string, module: ObservableModule, alias?: string): ObservableVariable;

  /** Delete the variable */
  delete(): void;
}

/**
 * Type for values that can be synced between Reactor and Observable
 */
export type ObservableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<any>
  | Record<string, any>
  | Promise<any>
  | AsyncIterable<any>;

/**
 * Metadata about the Observable integration
 */
export interface ObservableMetadata {
  /** Whether Observable runtime is available */
  isAvailable: boolean;

  /** Version of Observable runtime if available */
  version?: string;

  /** List of active module names */
  activeModules: string[];

  /** List of active variable names */
  activeVariables: string[];
}