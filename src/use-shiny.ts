/* eslint-disable @typescript-eslint/no-explicit-any */

import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { type ShinyClass } from "@posit/shiny/srcts/types/src/shiny";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "./utils";

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
    setValueFns: Array<(value: any) => void>;
    // Possibly debounce Shiny input value setter
    shinySetInputValueDebounced: (
      value: any,
      opts?: { priority?: EventPriority }
    ) => void;
  };
};

type OutputMap = {
  [key: string]: {
    // Output ID
    id: string;
    setValueFns: Array<(value: any) => void>;
    setRecalculatingFns: Array<(value: boolean) => void>;
  };
};

// TODO: Use weakmap?
class ShinyReactRegistry {
  inputs: InputMap = {};
  outputs: OutputMap = {};
  private bindAllScheduled = false;

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

  registerInput(
    inputId: string,
    setValueFn: (value: any) => void,
    opts: { priority?: EventPriority; debounceMs?: number } = {}
  ) {
    const { debounceMs = 100 } = opts;
    const setInputValueOpts: { priority?: EventPriority } = {};
    if (opts.priority) {
      setInputValueOpts.priority = opts.priority;
    }

    if (!this.inputs[inputId]) {
      this.inputs[inputId] = {
        id: inputId,
        setValueFns: [],
        shinySetInputValueDebounced: debounce((value: any) => {
          window.Shiny.setInputValue!(inputId, value, setInputValueOpts);
        }, debounceMs),
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

      this.scheduleBindAll();
    }

    // Do we need to dedupe?
    this.outputs[outputId].setValueFns.push(setValue);
    this.outputs[outputId].setRecalculatingFns.push(setRecalculating);
  }

  /**
   * Schedules a Shiny binding operation to run after DOM updates are complete.
   *
   * Note: I'm not sure if this is 100% reliable. I believe we need to avoid
   * overlapping calls to bindAll(), and am not sure if requestAnimationFrame()
   * will provide perfect reliability for this.
   */
  private scheduleBindAll() {
    if (this.bindAllScheduled) {
      return;
    }

    this.bindAllScheduled = true;

    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      window.Shiny.unbindAll?.(document.body);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      window.Shiny.bindAll?.(document.body);
      this.bindAllScheduled = false;
    });
  }

  hasInput(inputId: string) {
    return this.inputs[inputId] !== undefined;
  }

  setInputValue(
    inputId: string,
    value: any,
    opts?: { priority?: EventPriority }
  ) {
    if (!this.inputs[inputId]) {
      console.error(`Input ${inputId} not found`);
      return;
    }
    this.inputs[inputId].shinySetInputValueDebounced(value, opts);
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
