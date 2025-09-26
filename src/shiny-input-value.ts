import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { getShiny } from "./get-shiny";
import { createDebouncedFn, type DebouncedFunction } from "./utils";
import { Value, ValueStore } from "./value-store";

const DEFAULT_DEBOUNCE_MS = 100;

type ShinyInputValueOptions = {
  debounceMs?: number;
  priority?: EventPriority;
};

export class ShinyInputValue<T> extends Value<T> {
  protected _inputId: string;
  protected _priority?: EventPriority;
  protected _debouncedSendToShiny: DebouncedFunction<(value: T) => void>;

  constructor(inputId: string, initialValue: T, opts?: ShinyInputValueOptions) {
    super(initialValue);
    this._inputId = inputId;
    this._priority = opts?.priority;

    let debounceMs: number;
    // opts.debounceMs could be 0, so we can't use falsy check
    if (opts?.debounceMs === undefined) {
      debounceMs = DEFAULT_DEBOUNCE_MS;
    } else {
      debounceMs = opts.debounceMs;
    }

    this._debouncedSendToShiny = createDebouncedFn(
      this.sendToShiny.bind(this),
      debounceMs,
    );

    this.addUpdateHook(this._debouncedSendToShiny);
  }

  private sendToShiny(value: T): void {
    // Send the value to Shiny server
    const shiny = getShiny();
    if (shiny && shiny.setInputValue) {
      const options: { priority?: EventPriority } = {};
      if (this._priority !== undefined) {
        options.priority = this._priority;
      }
      shiny.setInputValue(this._inputId, value, options);
    }
  }

  getInputId(): string {
    return this._inputId;
  }

  setPriority(priority: EventPriority): void {
    this._priority = priority;
  }

  getPriority(): EventPriority | undefined {
    return this._priority;
  }

  updateDebounceDelay(debounceMs: number): void {
    this._debouncedSendToShiny.setDelay(debounceMs);
  }

  getDebounceDelay(): number {
    return this._debouncedSendToShiny.getDelay();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ShinyInputValueStore extends ValueStore<ShinyInputValue<any>> {
  override getOrCreate<T>(
    inputId: string,
    initialValue: T,
    opts?: ShinyInputValueOptions,
  ): ShinyInputValue<T> {
    let value = this.get<T>(inputId);
    if (!value) {
      value = new ShinyInputValue<T>(inputId, initialValue, opts);
      this.set(inputId, value);
    }

    return value as ShinyInputValue<T>;
  }
}

let globalShinyInputValueStore: ShinyInputValueStore | undefined = undefined;

export function getShinyInputValueStore(): ShinyInputValueStore {
  if (!globalShinyInputValueStore) {
    globalShinyInputValueStore = new ShinyInputValueStore();
  }
  return globalShinyInputValueStore;
}
