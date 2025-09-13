/* eslint-disable @typescript-eslint/no-explicit-any */

import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { useCallback, useEffect, useState } from "react";
import "./message-registry"; // Initialize message registry
import "./react-registry"; // Initialize react registry

/**
 * A React hook for managing a Shiny input value.
 *
 * This hook initializes a state variable with `defaultValue` and returns the
 * current value and a function to update it, similar to `React.useState`.
 *
 * When the component mounts, it waits for Shiny to initialize. Once Shiny is
 * initialized, this hook registers the input with the Shiny React registry and
 * uses debounced updates to send values to the Shiny server via
 * `window.Shiny.setInputValue()`.
 *
 * The hook supports debouncing to optimize performance by batching rapid
 * updates, and allows setting priority levels for input events.
 *
 * Note: This hook only sends data *to* Shiny. It does not automatically update
 * the React state if the input is changed on the server-side (e.g., using
 * `updateTextInput()`). For two-way binding, a custom Shiny input binding would
 * be required.
 *
 * @param id The ID that will be used for the Shiny input (`input$<id>`).
 * @param defaultValue The initial value for the input.
 * @param options Optional configuration object.
 * @param options.debounceMs Debounce delay in milliseconds for input updates
 * (default: 100).
 * @param options.priority Priority level for the input event (from Shiny's
 * EventPriority enum).
 * @returns A tuple containing the current value and a function to set the
 * value: `[value, setValue]`.
 */
export function useShinyInput<T>(
  id: string,
  defaultValue: T,
  {
    debounceMs = 100,
    priority,
  }: {
    debounceMs?: number;
    priority?: EventPriority;
  } = {}
): [T, (value: T) => void] {
  // NOTE: It's a little odd that debounceMs and priority passed this way; the
  // debounceMs is associated with the specific input name, and in Shiny's API,
  // priority is associated with each individual call to setInputValue(). But
  // here they're both associated with the input name, and also if there are
  // multiple calls to useShinyInput("foo"), then the priority will be from the
  // first call. This all should be straightened out in the future.

  const [value, setValue] = useState<T>(defaultValue);
  const shinyInitialized = useShinyInitialized();

  useEffect(() => {
    if (!shinyInitialized) {
      return;
    }
    // Don't register and set value more than once.
    if (id in window.Shiny.reactRegistry.inputs) {
      return;
    }

    window.Shiny.reactRegistry.registerInput(id, setValue, {
      debounceMs,
      priority,
    });
    window.Shiny.reactRegistry.setInputValue(id, value);
    // TODO: Cleanup? in case id changes or something like that.
  }, [id, shinyInitialized, debounceMs, priority, value]);

  const setValueWrapped = useCallback(
    (value: T) => {
      if (!shinyInitialized) {
        return;
      }

      window.Shiny.reactRegistry.setInputValue(id, value);
    },
    [shinyInitialized, id]
  );

  // useEffect(() => {
  //   if (!shinyInitialized) {
  //     return;
  //   }

  //   window.Shiny.setInputValue!(inputId, value);
  // }, [shinyInitialized, inputId, value]);

  return [value, setValueWrapped];
}

/**
 * Hook to receive and subscribe to Shiny output values from the server. Creates
 * a hidden DOM element and registers a custom Shiny output binding to receive
 * reactive data updates for the specified outputId.
 *
 * @param outputId The ID of the Shiny output to subscribe to.
 * @param defaultValue Optional default value to use before the first server
 * update.
 * @returns A tuple containing [value, recalculating] where:
 *   - value: The current value of the Shiny output
 *   - recalculating: Boolean indicating if the server is currently
 *     recalculating this output
 */
export function useShinyOutput<T>(
  outputId: string,
  defaultValue: T | undefined = undefined
): [T | undefined, boolean] {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const shinyInitialized = useShinyInitialized();

  useEffect(() => {
    if (!shinyInitialized) {
      return;
    }
    window.Shiny.reactRegistry.registerOutput(
      outputId,
      setValue,
      setRecalculating
    );
  }, [outputId, shinyInitialized]);

  return [value, recalculating];
}

// TODO: Implement useShinyOutputValue and useShinyOutputRecalculating
// TODO: Also get error value?

/**
 * A React hook for handling messages from the Shiny server.
 *
 * This hook registers a message handler with Shiny that will be called when the
 * server sends a message of the specified type using `post_message()` (which is
 * a wrapper for `session.send_custom_message()` with extra functionality.)
 *
 * The hook waits for Shiny to initialize before registering the handler and
 * properly manages the handler lifecycle, re-registering when dependencies
 * change.
 *
 * @param messageType The type/name of the custom message to listen for.
 * @param handler The function to call when a message of this type is received.
 * The handler receives the message data as its parameter.
 */
export function useShinyMessageHandler<T = any>(
  messageType: string,
  handler: (data: T) => void
): void {
  const shinyInitialized = useShinyInitialized();

  useEffect(() => {
    if (!shinyInitialized || !messageType || !handler) {
      return;
    }

    // Register the message handler with our dedicated message registry
    window.Shiny.messageRegistry.addHandler(messageType, handler);

    // Cleanup function that removes the handler when component unmounts
    // or when messageType/handler changes
    return () => {
      window.Shiny.messageRegistry.removeHandler(messageType, handler);
    };
  }, [shinyInitialized, messageType, handler]);
}

/**
 * A React hook that tracks whether Shiny has been initialized.
 *
 * @returns A boolean indicating whether Shiny has been initialized.
 */
export function useShinyInitialized(): boolean {
  const [shinyInitialized, setShinyInitialized] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window.Shiny.initializedPromise.then(() => {
      setShinyInitialized(true);
    });
  }, []);

  return shinyInitialized;
}
