// Observable extension for Reactor
export { createObservableExtension, getObservableModules, disposeObservableModule, disposeAllObservableModules } from "./reactor-observable";
export type { ObservableOptions, ObservablePlotOptions, ObservableObserver, ObservableModule, ObservableVariable, ObservableValue, ObservableMetadata } from "./types";
export {
  isObservableAvailable,
  isObservablePlotAvailable,
  getObservableMetadata,
  toObservableValue,
  fromObservableValue,
  inferPlotOptions,
  createDataTransformer,
  loadObservableRuntime,
  loadObservablePlot,
  createObservableContainer,
  formatObservableValue,
  combineForObservable,
  createObservableTable
} from "./utils";

// Re-export the main extension for convenience
export { createObservableExtension as ObservableExtension } from "./reactor-observable";