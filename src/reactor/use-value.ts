import { useCallback, useEffect, useState } from "react";
import { getValueStore } from "./value-store";

// Import extension system - using relative paths since this might be moved to a separate package
import { createExtensions } from "./extensions/registry";
import type { UseValueOptions } from "./extensions/types";

/**
 * A React hook for managing external state values outside of the React tree.
 *
 * This hook provides a way to store and share state across multiple components
 * without prop drilling or React context. It allows you to maintain state that
 * persists across component re-renders and unmounts.
 *
 * The hook returns the current value and a setter function, similar to
 * React.useState, but the state is stored in an external ValueStore that can be
 * accessed by any component using the same key.
 *
 * Extensions can be enabled via the options parameter to add functionality like
 * notifying external systems when values change (e.g., Shiny servers,
 * Observable notebooks).
 *
 * @param key The unique identifier for this value in the store.
 * @param defaultValue The initial value to use if none exists in the store.
 * @param options Optional configuration including notification targets and
 * their options.
 * @returns A tuple containing the current value and a function to set the
 * value: `[value, setValue]`.
 */
export function useValue<T>(
  key: string,
  defaultValue: T,
  options: UseValueOptions = {},
): [T, (value: T) => void] {
  const { notify, ...extensionOptions } = options;

  const valueStore = getValueStore();
  const valueObj = valueStore.getOrCreate<T>(key, defaultValue);

  // The store may already have a value for this key, so we need to make sure we
  // initialize the useState with the value from the store.
  const [value, setValue] = useState<T>(valueObj.getValue());

  // Handle extensions based on notification configuration
  useEffect(() => {
    if (!notify) return;

    const cleanupFunctions = createExtensions(valueObj, notify, {
      name: key,
      ...extensionOptions,
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [valueObj, notify, key, JSON.stringify(extensionOptions)]);

  useEffect(() => {
    // Connect the setValue function to the valueObj so that it will be called
    // when someone else calls valueObj.setValue().
    valueObj.subscribe(setValue);

    // Make sure we have the latest value
    valueObj.invokeUpdateHooks();

    return () => {
      valueObj.unsubscribe(setValue);
    };
  }, [key, valueObj]);

  const setValueWrapped = useCallback(
    (newValue: T) => {
      valueObj.setValue(newValue);
    },
    [valueObj],
  );

  return [value, setValueWrapped];
}
