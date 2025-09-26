// Extension system exports
export {
  clearExtensions,
  createExtensions,
  getExtension,
  getRegisteredExtensions,
  registerExtension,
  unregisterExtension,
} from "./registry";
export type {
  Extension,
  ExtensionFactory,
  NotifyOption,
  UseValueOptions,
} from "./types";

// Built-in extensions
export { createShinyExtension } from "./shiny";
export type { ShinyOptions } from "./shiny";
