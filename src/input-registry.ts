/* eslint-disable @typescript-eslint/no-explicit-any */
import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { getShiny } from "./get-shiny";
import { createDebouncedFn, type DebouncedFunction } from "./utils";

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
    getShiny()?.setInputValue!(this.id, value, this.opts);
  }

  updateDebounceDelay(debounceMs: number) {
    this.shinySetInputValueDebounced.setDelay(debounceMs);
  }

  updatePriority(priority: EventPriority) {
    this.opts.priority = priority;
  }

  addUseStateSetValueFn(fn: (value: T) => void) {
    this.useStateSetValueFns.add(fn);
  }

  removeUseStateSetValueFn(fn: (value: T) => void) {
    this.useStateSetValueFns.delete(fn);
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
