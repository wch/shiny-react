import { useCallback, useEffect, useState } from "react";
import { getValueStore } from "./value-store";

/**
 * A React hook for managing external state values outside of the React tree.
 *
 * This hook provides a way to store and share state across multiple components
 * without prop drilling or React context. It is similar to libraries like
 * Zustand or Jotai, allowing you to maintain state that persists across
 * component re-renders and unmounts.
 *
 * The hook returns the current value and a setter function, similar to
 * React.useState, but the state is stored in an external ValueStore that can be
 * accessed by any component using the same key.
 *
 * Unlike useShinyInput, this hook does not include debouncing since it's for
 * pure React state management without server communication.
 *
 * @param key The unique identifier for this value in the store.
 * @param defaultValue The initial value to use if none exists in the store.
 * @returns A tuple containing the current value and a function to set the
 * value: `[value, setValue]`.
 */
export function useValue<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const valueStore = getValueStore();
  const valueObj = valueStore.getOrCreate<T>(key, defaultValue);

  // The store may already have a value for this key, so we need to make sure we
  // initialize the useState with the value from the store.
  const [value, setValue] = useState<T>(valueObj.getValue());

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
