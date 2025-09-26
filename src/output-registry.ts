/* eslint-disable @typescript-eslint/no-explicit-any */

import { getShiny } from "./get-shiny";
import { getValueStore } from "./reactor";

export type ErrorsMessageValue = {
  message: string;
  call: string[];
  type?: string[];
};

export class OutputRegistryEntry<T> {
  id: string; // Output ID

  constructor(id: string) {
    this.id = id;
  }

  setValue(value: T) {
    // Get the reactor Value from the ValueStore and update it directly
    // This will notify all React components that are subscribed to this Value
    const valueStore = getValueStore();
    // let reactorValue = valueStore.get<T>(this.id);
    // if (!reactorValue) {
    //   // Create the Value if it doesn't exist (edge case where Shiny sends data
    //   // before any component has called useShinyOutput)
    //   reactorValue = valueStore.getOrCreate<T>(this.id, undefined as any);
    // }
    const reactorValue = valueStore.getOrCreate<T>(this.id, undefined as T);
    reactorValue.setValue(value);
  }

  setRecalculating(value: boolean) {
    // Get the reactor Value for recalculating state and update it directly
    // This will notify all React components that are subscribed to this Value
    const valueStore = getValueStore();
    const recalculatingKey = `${this.id}:recalculating`;
    let recalculatingValue = valueStore.get<boolean>(recalculatingKey);
    if (!recalculatingValue) {
      // Create the recalculating Value if it doesn't exist
      recalculatingValue = valueStore.getOrCreate<boolean>(
        recalculatingKey,
        false,
      );
    }
    recalculatingValue.setValue(value);
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

  add(outputId: string, setRecalculating: (value: boolean) => void) {
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
      const outputEntry = getShinyOutputRegistry()!.get(el.id);
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
      const outputEntry = getShinyOutputRegistry()!.get(el.id);
      if (!outputEntry) {
        console.error(`Output ${el.id} not found`);
        return;
      }
      outputEntry.setRecalculating(show);
    }
  }

  shiny.outputBindings.register(new ReactOutputBinding(), "shiny.reactOutput");
}

const outputRegistry: OutputRegistry = new OutputRegistry();

export function getShinyOutputRegistry() {
  return outputRegistry;
}

createReactOutputBinding();
