import { type EventPriority } from "@posit/shiny/srcts/types/src/inputPolicies";
import { getShiny } from "./get-shiny";
import type { Value } from "./reactor";
import { registerExtension } from "./reactor/extensions/registry";
import type { Extension, ExtensionFactory } from "./reactor/extensions/types";
import { createDebouncedFn, type DebouncedFunction } from "./utils";

const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Options for configuring the Shiny extension
 */
export interface ShinyOptions {
  /** The input ID to use for Shiny.setInputValue() */
  inputId: string;
  /** Debounce delay in milliseconds (default: 100) */
  debounceMs?: number;
  /** Priority level for the input event */
  priority?: EventPriority;
}

let shinyInitialized = false;
let shinyInitializedPromise: Promise<void>;
{
  const shiny = getShiny();
  if (shiny) {
    shinyInitializedPromise = shiny.initializedPromise;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    shinyInitializedPromise.then(() => {
      shinyInitialized = true;
    });
  }
}

/**
 * Extension that notifies a Shiny server when a Value changes
 */
class ShinyExtension<T> implements Extension<T> {
  readonly name = "shiny";
  private debouncedSendToShiny: DebouncedFunction<(value: T) => void>;
  private cleanupFn?: () => void;
  private hasPendingSend = false;

  constructor(
    private value: Value<T>,
    private options: ShinyOptions,
  ) {
    // Create debounced function for sending to Shiny
    this.debouncedSendToShiny = createDebouncedFn(
      this.sendToShiny.bind(this),
      this.options.debounceMs ?? DEFAULT_DEBOUNCE_MS,
    );
  }

  private sendToShiny(value: T): void {
    // If Shiny isn't ready yet, queue a send
    if (!shinyInitialized) {
      this.hasPendingSend = true;
      return;
    }

    // Actually send to Shiny
    this.actualSendToShiny(value);
  }

  private actualSendToShiny(value: T): void {
    const shiny = getShiny();
    if (shiny?.setInputValue) {
      const options: { priority?: EventPriority } = {};
      if (this.options.priority !== undefined) {
        options.priority = this.options.priority;
      }
      shiny.setInputValue(this.options.inputId, value, options);
    }
  }

  private async sendWhenShinyIsInitialized(value: Value<T>): Promise<void> {
    const shiny = getShiny();
    if (!shiny) {
      return;
    }

    // Wait for Shiny to initialize
    await shinyInitializedPromise;

    const currentValue = value.getValue();
    if (this.hasPendingSend) {
      this.actualSendToShiny(currentValue);
      this.hasPendingSend = false;
    }
  }

  attach(value: Value<T>): () => void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.sendWhenShinyIsInitialized(value);

    // Add the debounced send function as an update hook
    value.addUpdateHook(this.debouncedSendToShiny);

    this.cleanupFn = () => {
      value.removeUpdateHook(this.debouncedSendToShiny);
      this.debouncedSendToShiny.cancel();
    };

    return this.cleanupFn;
  }

  /**
   * Updates the debounce delay
   */
  updateDebounceDelay(debounceMs: number): void {
    this.debouncedSendToShiny.setDelay(debounceMs);
  }

  /**
   * Gets the current debounce delay
   */
  getDebounceDelay(): number {
    return this.debouncedSendToShiny.getDelay();
  }

  /**
   * Updates the priority setting
   */
  updatePriority(priority: EventPriority): void {
    this.options.priority = priority;
  }

  /**
   * Gets the current priority setting
   */
  getPriority(): EventPriority | undefined {
    return this.options.priority;
  }

  /**
   * Gets the input ID
   */
  getInputId(): string {
    return this.options.inputId;
  }
}

/**
 * Factory function for creating Shiny extensions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createShinyExtension: ExtensionFactory<any, ShinyOptions> = <T>(
  value: Value<T>,
  options: ShinyOptions,
) => {
  return new ShinyExtension(value, options);
};

// Auto-register the shiny extension
registerExtension("shiny", createShinyExtension);
