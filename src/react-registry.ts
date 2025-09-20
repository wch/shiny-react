/* eslint-disable @typescript-eslint/no-explicit-any */
import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { createDebouncedFn, type DebouncedFunction } from "./utils";

type ErrorsMessageValue = {
  message: string;
  call: string[];
  type?: string[];
};

export class InputRegistryEntry<T> {
  id: string; // Shiny input ID
  value: T;
  useStateSetValueFns: Set<(value: T) => void>;
  shinySetInputValueDebounced: DebouncedFunction<(value: T) => void>;
  opts: { priority?: EventPriority; debounceMs: number } = {
    debounceMs: 100,
  };

  constructor(id: string, value: T) {
    this.id = id;
    this.value = value;
    this.useStateSetValueFns = new Set();
    this.shinySetInputValueDebounced = createDebouncedFn(
      this.setShinyInputValue.bind(this),
      this.opts.debounceMs,
    );
  }

  isEmpty() {
    return this.useStateSetValueFns.size === 0;
  }

  private setShinyInputValue(value: T) {
    window.Shiny.setInputValue!(this.id, value, this.opts);
  }

  updateDebounceDelay(debounceMs: number) {
    this.shinySetInputValueDebounced.setDelay(debounceMs);
  }

  updatePriority(priority: EventPriority) {
    this.opts.priority = priority;
  }

  addUseStateSetValueFn(useStateSetValueFn: (value: T) => void) {
    this.useStateSetValueFns.add(useStateSetValueFn);
  }

  removeUseStateSetValueFn(useStateSetValueFn: (value: T) => void) {
    this.useStateSetValueFns.delete(useStateSetValueFn);
  }

  setValue(value: T) {
    this.value = value;
    this.shinySetInputValueDebounced(value);
    this.useStateSetValueFns.forEach((fn) => fn(value));
  }

  getValue(): T {
    return this.value;
  }
}

type OutputRegistryEntry = {
  id: string; // Output ID
  useStateSetValueFns: Set<(value: any) => void>;
  useStateSetRecalculatingFns: Set<(value: boolean) => void>;
};

type OutputMap = Map<string, OutputRegistryEntry>;

export class InputRegistry {
  private inputs: Map<string, InputRegistryEntry<any>> = new Map();

  /**
   * Get an input registry entry by ID
   */
  get<T>(inputId: string): InputRegistryEntry<T> | undefined {
    return this.inputs.get(inputId) as InputRegistryEntry<T> | undefined;
  }

  /**
   * Check if an input registry entry exists
   */
  has(inputId: string): boolean {
    return this.inputs.has(inputId);
  }

  /**
   * Add a new input registry entry
   */
  add<T>(inputId: string, value: T): InputRegistryEntry<T> {
    if (this.inputs.has(inputId)) {
      throw new Error(`Input ${inputId} already exists`);
    }

    const entry = new InputRegistryEntry<T>(inputId, value);
    this.inputs.set(inputId, entry);
    return entry;
  }

  /**
   * Get or create an input registry entry
   *
   * Note that value is used only if the entry is created; if it already exists,
   * then the existing entry is returned and the value is unused.
   */
  getOrCreate<T>(inputId: string, value: T): InputRegistryEntry<T> {
    let entry = this.get<T>(inputId);
    if (!entry) {
      entry = this.add<T>(inputId, value);
    }
    return entry;
  }

  /**
   * Remove an input registry entry
   */
  remove(inputId: string): boolean {
    return this.inputs.delete(inputId);
  }

  /**
   * Get all input IDs
   */
  keys(): IterableIterator<string> {
    return this.inputs.keys();
  }

  /**
   * Get the number of registered inputs
   */
  size(): number {
    return this.inputs.size;
  }
}

export class ShinyReactRegistry {
  inputs: InputRegistry = new InputRegistry();
  outputs: OutputMap = new Map();
  private bindAllScheduled = false;

  registerOutput<T>(
    outputId: string,
    setValue: (value: T) => void,
    setRecalculating: (value: boolean) => void,
  ) {
    if (!this.outputs.has(outputId)) {
      // Need to create a dummy div element with the ID, so that we have
      // something to bind to.
      const div = document.createElement("div");
      div.className = "react-shiny-output";
      div.id = outputId;
      div.textContent = `This is the output div for ${outputId}`;
      // Will display: none make the output not work?
      div.style.visibility = "hidden";
      document.body.appendChild(div);

      this.outputs.set(outputId, {
        id: outputId,
        useStateSetValueFns: new Set(),
        useStateSetRecalculatingFns: new Set(),
      });

      this.scheduleBindAll();
    }

    this.outputs.get(outputId)!.useStateSetValueFns.add(setValue);
    this.outputs
      .get(outputId)!
      .useStateSetRecalculatingFns.add(setRecalculating);
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

  hasOutput(outputId: string) {
    return this.outputs.has(outputId);
  }
}

window.Shiny.reactRegistry = new ShinyReactRegistry();

export class ReactOutputBinding extends window.Shiny.OutputBinding {
  override find(scope: HTMLElement | JQuery<HTMLElement>): JQuery<HTMLElement> {
    return $(scope).find(".react-shiny-output");
  }

  override renderValue(el: HTMLElement, data: any): void {
    if (!window.Shiny.reactRegistry.outputs.has(el.id)) {
      console.error(`Output ${el.id} not found`);
      return;
    }
    window.Shiny.reactRegistry.outputs
      .get(el.id)!
      .useStateSetValueFns.forEach((fn) => fn(data));
  }

  override renderError(el: HTMLElement, err: ErrorsMessageValue): void {
    console.log(`Error for ${el.id}: ${err}`);
  }

  override showProgress(el: HTMLElement, show: boolean): void {
    // console.log(`Progress for ${el.id}: ${show}`);
    if (!window.Shiny.reactRegistry.outputs.has(el.id)) {
      console.error(`Output ${el.id} not found`);
      return;
    }
    window.Shiny.reactRegistry.outputs
      .get(el.id)!
      .useStateSetRecalculatingFns.forEach((fn) => fn(show));
  }
}

window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput",
);
