import React, { useCallback, useEffect, useState } from "react";
import { getReactorStore } from "./reactor-store";

// Import extension system - using relative paths since this might be moved to a separate package
import { createExtensions } from "./extensions/registry";
import type { UseReactorOptions } from "./extensions/types";

/**
 * A React hook for managing external state values outside of the React tree.
 *
 * This hook provides a way to store and share state across multiple components
 * without prop drilling or React context. It allows you to maintain state that
 * persists across component re-renders and unmounts.
 *
 * The hook returns the current value and a setter function, similar to
 * React.useState, but the state is stored in an external ReactorStore that can
 * be accessed by any component using the same key.
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
export function useReactor<T>(
  key: string,
  defaultValue: T,
  options: UseReactorOptions = {},
): [T, (value: T) => void] {
  const { notify, ...extensionOptions } = options;

  const reactorStore = getReactorStore();
  const reactor = reactorStore.getOrCreate<T>(key, defaultValue);

  // This useState with the current value from the reactor is an unusual
  // pattern.
  //
  // useState will only use the initial value the first time a component is
  // rendered. Subsequent re-renders will use the value from the previous
  // render. However, in some cases, the first time a component is rendered (or
  // if it is removed and then the same component is added back later), there
  // will already be a reactor for that key in the store. When that happens,
  // we want to use that reactor's value as the initial value for the useState.
  const [value, setValue] = useState<T>(reactor.getValue());

  // Handle extensions based on notification configuration
  useEffect(() => {
    if (!notify) return;

    const cleanupFunctions = createExtensions(reactor, notify, {
      name: key,
      ...extensionOptions,
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [reactor, notify, key, JSON.stringify(extensionOptions)]);

  useEffect(() => {
    // Connect the setValue function to the reactor so that it will be called
    // when someone else calls reactor.setValue().
    reactor.subscribe(setValue);

    // Make sure we have the latest value
    reactor.invokeUpdateHooks();

    return () => {
      reactor.unsubscribe(setValue);
    };
  }, [key, reactor]);

  const setValueWrapped = useCallback(
    (newValue: T) => {
      reactor.setValue(newValue);
    },
    [reactor],
  );

  return [value, setValueWrapped];
}
