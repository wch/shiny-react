import type { Reactor } from "..";
import type { ExtensionFactory, NotifyOption } from "./types";

/**
 * Global registry of extension factories
 */
const extensionFactories = new Map<string, ExtensionFactory>();

/**
 * Registers an extension factory with the given name
 * @param name The name to register the extension under
 * @param factory The factory function that creates the extension
 */
export function registerExtension(
  name: string,
  factory: ExtensionFactory,
): void {
  extensionFactories.set(name, factory);
}

/**
 * Gets a registered extension factory by name
 * @param name The name of the extension to retrieve
 * @returns The extension factory or undefined if not found
 */
export function getExtension(name: string): ExtensionFactory | undefined {
  return extensionFactories.get(name);
}

/**
 * Lists all registered extension names
 * @returns Array of registered extension names
 */
export function getRegisteredExtensions(): string[] {
  return Array.from(extensionFactories.keys());
}

/**
 * Creates and attaches extensions to a Value based on notification configuration
 * @param value The Value instance to attach extensions to
 * @param notifyOptions The notification configuration (string or array of strings)
 * @param context Context information including name and additional options
 * @returns Array of cleanup functions for the created extensions
 */
export function createExtensions<T>(
  value: Reactor<T>,
  notifyOptions: NotifyOption,
  context: { name: string; [key: string]: any },
): (() => void)[] {
  const notifyTargets = Array.isArray(notifyOptions)
    ? notifyOptions
    : [notifyOptions];
  const cleanupFunctions: (() => void)[] = [];

  for (const notifyTarget of notifyTargets) {
    const factory = extensionFactories.get(notifyTarget);

    if (!factory) {
      console.warn(
        `Unknown notification target: ${notifyTarget}. Available extensions: ${getRegisteredExtensions().join(", ")}`,
      );
      continue;
    }

    try {
      const extension = factory(value, { inputId: context.name, ...context });
      const cleanup = extension.attach(value);
      cleanupFunctions.push(cleanup);
    } catch (error) {
      console.error(`Failed to create ${notifyTarget} extension:`, error);
    }
  }

  return cleanupFunctions;
}

/**
 * Removes an extension from the registry
 * @param name The name of the extension to remove
 * @returns True if the extension was removed, false if it didn't exist
 */
export function unregisterExtension(name: string): boolean {
  return extensionFactories.delete(name);
}

/**
 * Clears all registered extensions (primarily for testing)
 */
export function clearExtensions(): void {
  extensionFactories.clear();
}
