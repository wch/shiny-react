/* eslint-disable @typescript-eslint/no-explicit-any */
import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { debounce } from "./utils";

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
export class ShinyReactRegistry {
  inputs: InputMap = {};
  outputs: OutputMap = {};
  private bindAllScheduled = false;

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

window.Shiny.reactRegistry = new ShinyReactRegistry();

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
