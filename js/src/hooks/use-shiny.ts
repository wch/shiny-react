import { debounce } from "../utils/debounce";
import { useState, useEffect, useCallback } from "react";
import { ShinyClass } from "rstudio-shiny/srcts/types/src/shiny";

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
 * @param id The ID that will be used for the Shiny input (`input$<inputId>`).
 * @param defaultValue The initial value for the input.
 * @returns A tuple containing the current value and a function to set the value: `[value, setValue]`.
 */
export function useShinyInput<T>(
  id: string,
  defaultValue: T,
  { debounceMs = 200 }: { debounceMs?: number } = {}
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  const [shinyInitialized, setShinyInitialized] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await window.Shiny.initializedPromise;
      setShinyInitialized(true);

      window.Shiny.reactRegistry.registerInput(id, setValue);
      window.Shiny.reactRegistry.setInputValue(id, value);
    })();

    // TODO: Cleanup? This runs twice in dev mode
  }, []); // Run only once on mount

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
  defaultValue: T | undefined = undefined
): [T | undefined, boolean] {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  useEffect(() => {
    window.Shiny.reactRegistry.registerOutput(
      outputId,
      setValue,
      setRecalculating
    );
  }, [outputId]);

  return [value, recalculating];
}

// TODO: Implement useShinyOutputValue and useShinyOutputRecalculating
// TODO: Also get error value?

export class ReactOutputBinding extends window.Shiny.OutputBinding {
  override find(scope: HTMLElement | JQuery<HTMLElement>): JQuery<HTMLElement> {
    return $(scope).find(".react-shiny-output");
  }

  override renderValue(el: HTMLElement, data: any): void {
    window.Shiny.reactRegistry.outputs[el.id].setValueFns.forEach((fn) =>
      fn(data)
    );
  }

  override renderError(el: HTMLElement, err: ErrorsMessageValue): void {
    console.log(`Error for ${el.id}: ${err}`);
  }

  override showProgress(el: HTMLElement, show: boolean): void {
    // console.log(`Progress for ${el.id}: ${show}`);
    window.Shiny.reactRegistry.outputs[el.id].setRecalculatingFns.forEach(
      (fn) => fn(show)
    );
  }
}

window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput"
);

// Copied from shinyapp.d.ts
type ErrorsMessageValue = {
  message: string;
  call: string[];
  type?: string[];
};

type InputMap = {
  [key: string]: {
    // Input ID
    id: string;
    // setFoo functions for all React components which use this input ID
    setValueFns: Array<(value: any) => void>;
    // Possibly debounce Shiny input value setter
    shinySetInputValueDebounced: (value: any) => void;
  };
};

type OutputMap = {
  [key: string]: {
    // Output ID
    id: string;
    // setFoo functions for all React components which use this output ID
    setValueFns: Array<(value: any) => void>;
    setRecalculatingFns: Array<(value: boolean) => void>;
  };
};

// TODO: Use weakmap?
class ShinyReactRegistry {
  inputs: InputMap = {};
  outputs: OutputMap = {};

  constructor() {
    window.Shiny.addCustomMessageHandler("shinyReactSetInputs", (msg: any) => {
      for (const [inputId, value] of Object.entries(msg)) {
        if (this.inputs[inputId]) {
          // TODO: Don't use debounced version
          this.setInputValue(inputId, value);
        }
      }
    });
  }

  registerInput(inputId: string, setValueFn: (value: any) => void) {
    if (!this.inputs[inputId]) {
      this.inputs[inputId] = {
        id: inputId,
        setValueFns: [],
        shinySetInputValueDebounced: debounce((value: any) => {
          window.Shiny.setInputValue!(inputId, value);
        }, 100),
      };
    }
    this.inputs[inputId].setValueFns.push(setValueFn);
  }

  registerOutput(
    outputId: string,
    setValue: (value: any) => void,
    setRecalculating: (value: boolean) => void
  ) {
    if (!this.outputs[outputId]) {
      // Need to create a dummy div element with the ID, so that we have
      // something to bind to.
      const div = document.createElement("div");
      div.className = "react-shiny-output";
      div.id = outputId;
      div.textContent = `This is the output div for ${outputId}`;
      // Will display: none make the output not work?
      div.style.visibility = "hidden";
      document.body.appendChild(div);

      this.outputs[outputId] = {
        id: outputId,
        setValueFns: [],
        setRecalculatingFns: [],
      };
    }

    // Do we need to dedupe?
    this.outputs[outputId].setValueFns.push(setValue);
    this.outputs[outputId].setRecalculatingFns.push(setRecalculating);
  }

  hasInput(inputId: string) {
    return this.inputs[inputId] !== undefined;
  }

  setInputValue(inputId: string, value: any) {
    if (!this.inputs[inputId]) {
      console.error(`Input ${inputId} not found`);
      return;
    }
    this.inputs[inputId].shinySetInputValueDebounced(value);
    this.inputs[inputId].setValueFns.forEach((fn) => fn(value));
  }

  hasOutput(outputId: string) {
    return this.outputs[outputId] !== undefined;
  }
}

declare global {
  interface Window {
    Shiny: ShinyClass & {
      reactRegistry: ShinyReactRegistry;
    };
  }
}

window.Shiny.reactRegistry = new ShinyReactRegistry();
