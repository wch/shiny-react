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
  UseReactorOptions,
} from "./types";
