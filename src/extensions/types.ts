import type { Value } from "../reactive-values";

/**
 * Interface for extensions that can be attached to Value instances.
 * Extensions provide additional functionality like syncing with external systems.
 */
export interface Extension<T = any> {
  /**
   * Attaches the extension to a Value instance.
   * @param value The Value instance to attach to
   * @returns A cleanup function that removes the extension
   */
  attach(value: Value<T>): () => void;

  /** Unique name identifier for this extension */
  readonly name: string;
}

/**
 * Factory function that creates an Extension instance.
 * @param value The Value instance to create the extension for
 * @param options Configuration options for the extension
 * @returns A new Extension instance
 */
export type ExtensionFactory<T = any, TOptions = any> = (
  value: Value<T>,
  options: TOptions,
) => Extension<T>;

/**
 * Notification configuration - can be a single extension name or array of extension names
 */
export type NotifyOption = string | string[];

/**
 * Options passed to useValue for configuring extensions
 */
export interface UseValueOptions {
  /** Extensions to notify when value changes (e.g. "shiny", ["shiny", "observable"]) */
  notify?: NotifyOption;
  /** Additional options passed to extensions */
  [key: string]: any;
}
