/* eslint-disable @typescript-eslint/no-explicit-any */

import { getShiny } from "./get-shiny";

export type ErrorsMessageValue = {
  message: string;
  call: string[];
  type?: string[];
};

export class OutputRegistryEntry<T> {
  id: string; // Output ID
  private useStateSetValueFns: Set<(value: T) => void>;
  private useStateSetRecalculatingFns: Set<(value: boolean) => void>;

  constructor(id: string) {
    this.id = id;
    this.useStateSetValueFns = new Set();
    this.useStateSetRecalculatingFns = new Set();
  }

  addUseStateSetValueFn(fn: (value: T) => void) {
    this.useStateSetValueFns.add(fn);
  }

  removeUseStateSetValueFn(fn: (value: T) => void) {
    this.useStateSetValueFns.delete(fn);
  }

  addUseStateSetRecalculatingFn(fn: (value: boolean) => void) {
    this.useStateSetRecalculatingFns.add(fn);
  }

  removeUseStateSetRecalculatingFn(fn: (value: boolean) => void) {
    this.useStateSetRecalculatingFns.delete(fn);
  }

  setValue(value: T) {
    this.useStateSetValueFns.forEach((fn) => fn(value));
  }

  setRecalculating(value: boolean) {
    this.useStateSetRecalculatingFns.forEach((fn) => fn(value));
  }
}

export class OutputRegistry {
  private outputs: Map<string, OutputRegistryEntry<any>> = new Map();
  private bindAllScheduled = false;
  private container: HTMLElement;

  constructor() {
    const div = document.createElement("div");
    div.className = "shiny-react-output-container";
    div.style.visibility = "hidden";
    this.container = div;
    document.body.appendChild(this.container);
  }

  add<T>(
    outputId: string,
    setValue: (value: T) => void,
    setRecalculating: (value: boolean) => void,
  ) {
    let outputEntry = this.get(outputId);
    if (!outputEntry) {
      // Need to create a dummy div element with the ID, so that we have
      // something to bind to.
      const div = document.createElement("div");
      div.className = "shiny-react-output";
      div.id = outputId;
      div.textContent = `This is the output div for ${outputId}`;
      this.container.appendChild(div);

      outputEntry = new OutputRegistryEntry(outputId);
      this.outputs.set(outputId, outputEntry);

      this.scheduleBindAll();
    }

    outputEntry.addUseStateSetValueFn(setValue);
    outputEntry.addUseStateSetRecalculatingFn(setRecalculating);
  }

  has(outputId: string) {
    return this.outputs.has(outputId);
  }

  get(outputId: string) {
    return this.outputs.get(outputId);
  }

  remove(outputId: string) {
    this.outputs.delete(outputId);
    const outputDiv = document.getElementById(outputId);
    if (outputDiv) {
      outputDiv.remove();
    }
    this.scheduleBindAll();
  }

  /**
   * Schedules a Shiny binding operation to run after DOM updates are complete.
   *
   * Note: I'm not sure if this is 100% reliable. I believe we need to avoid
   * overlapping calls to bindAll(), and am not sure if requestAnimationFrame()
   * will provide perfect reliability for this.
   */
  private scheduleBindAll() {
    const shiny = getShiny();
    if (!shiny) {
      return;
    }

    if (this.bindAllScheduled) {
      return;
    }

    this.bindAllScheduled = true;

    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      shiny.unbindAll?.(this.container);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      shiny.bindAll?.(this.container);
      this.bindAllScheduled = false;
    });
  }
}

/**
 * Create and register the React output binding when Shiny is available
 */
export function createReactOutputBinding() {
  const shiny = getShiny();
  if (!shiny) {
    return;
  }

  class ReactOutputBinding extends shiny.OutputBinding {
    override find(
      scope: HTMLElement | JQuery<HTMLElement>,
    ): JQuery<HTMLElement> {
      return $(scope).find(".shiny-react-output");
    }

    override renderValue(el: HTMLElement, data: any): void {
      const outputEntry = shiny!.reactRegistry?.outputs.get(el.id);
      if (!outputEntry) {
        console.error(`Output ${el.id} not found`);
        return;
      }
      outputEntry.setValue(data);
    }

    override renderError(el: HTMLElement, err: ErrorsMessageValue): void {
      console.log(`Error for ${el.id}: ${err}`);
    }

    override showProgress(el: HTMLElement, show: boolean): void {
      // console.log(`Progress for ${el.id}: ${show}`);
      const outputEntry = shiny!.reactRegistry?.outputs.get(el.id);
      if (!outputEntry) {
        console.error(`Output ${el.id} not found`);
        return;
      }
      outputEntry.setRecalculating(show);
    }
  }

  shiny.outputBindings.register(new ReactOutputBinding(), "shiny.reactOutput");
}
