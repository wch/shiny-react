import { useState, useEffect } from "react";

/**
 * A React hook for managing a Shiny input value.
 *
 * This hook initializes a state variable with `defaultValue`. It returns the
 * current value and a function to update it, similar to `React.useState`.
 *
 * When the component mounts, it waits for Shiny to initialize. Once Shiny is
 * initialized, this hook uses an effect to call `window.Shiny.setInputValue()`
 * whenever the input's `value` or `inputId` changes, effectively sending updates
 * from the React component to the Shiny server.
 *
 * Note: This hook only sends data *to* Shiny. It does not automatically update
 * the React state if the input is changed on the server-side (e.g., using
 * `updateTextInput()`). For two-way binding, a custom Shiny input binding
 * would be required.
 *
 * @param inputId The ID that will be used for the Shiny input (`input$<inputId>`).
 * @param defaultValue The initial value for the input.
 * @returns A tuple containing the current value and a function to set the value: `[value, setValue]`.
 */
export function useShinyInput<T>(
  inputId: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  const [shinyInitialized, setShinyInitialized] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await window.Shiny.initializedPromise;
      setShinyInitialized(true);
    })();
  }, []); // Run only once on mount

  useEffect(() => {
    if (!shinyInitialized) {
      return;
    }
    window.Shiny.setInputValue!(inputId, value);
  }, [shinyInitialized, inputId, value]);

  return [value, setValue];
}

/**
 * Hook to receive and subscribe to Shiny output values.
 * Creates a hidden DOM element and a custom Shiny output binding
 * to receive data updates for the specified outputId.
 *
 * @param outputId The ID of the Shiny output to subscribe to.
 * @param defaultValue Optional default value.
 * @returns The current value of the Shiny output.
 */
export function useShinyOutput<T>(
  outputId: string,
  defaultValue: T | null = null,
): T | null {
  const [value, setValue] = useState<T | null>(defaultValue);

  useEffect(() => {
    if (!reactShinyOutputSetValueMap[outputId]) {
      // Need to create a dummy div element with the ID, so that we have
      // something to bind to.
      const div = document.createElement("div");
      div.className = "react-shiny-output";
      div.id = outputId;
      div.textContent = `This is the output div for ${outputId}`;
      // Will display: none make the output not work?
      div.style.visibility = "hidden";
      document.body.appendChild(div);
    } else {
      // alert if already exists
      console.warn(`Output ID ${outputId} already exists.`);
    }
    reactShinyOutputSetValueMap[outputId] = setValue;
  }, [outputId]);

  return value;
}

// Keep a setter for each output binding
const reactShinyOutputSetValueMap: { [key: string]: any } = {};

export class ReactOutputBinding extends window.Shiny.OutputBinding {
  override find(scope: HTMLElement | JQuery<HTMLElement>): JQuery<HTMLElement> {
    return $(scope).find(".react-shiny-output");
  }

  override renderValue(el: HTMLElement, data: any): void {
    reactShinyOutputSetValueMap[el.id](data);
  }

  override renderError(el: HTMLElement, err: ErrorsMessageValue): void {
    console.log(`Error for ${el.id}: ${err}`);
  }
}

window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput",
);

// Copied from shinyapp.d.ts
type ErrorsMessageValue = {
  message: string;
  call: string[];
  type?: string[];
};
