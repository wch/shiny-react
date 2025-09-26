import { getShiny } from "./get-shiny";
import { InputRegistry } from "./input-registry";
import { OutputRegistry } from "./output-registry";
import { getShinyInputValueStore } from "./shiny-input-value";

export interface ShinyReactRegistry {
  inputs: InputRegistry;
  outputs: OutputRegistry;
  shinyValueStore: ReturnType<typeof getShinyInputValueStore>;
}

let reactRegistry: ShinyReactRegistry | undefined = undefined;
/**
 * Initialize the global react registry and make it available on window.Shiny
 * This function should be called after Shiny is initialized
 */
export function initializeReactRegistry(): void {
  // Create registries that can work with or without Shiny
  reactRegistry = {
    inputs: new InputRegistry(),
    outputs: new OutputRegistry(),
    shinyValueStore: getShinyInputValueStore(),
  };

  const shiny = getShiny();
  if (!shiny) {
    return;
  }
  shiny.reactRegistry = reactRegistry;
}

/**
 * Get the react registry, whether it's attached to window.Shiny or standalone
 */
export function getReactRegistry(): ShinyReactRegistry {
  const shiny = getShiny();
  if (!shiny) {
    if (!reactRegistry) {
      throw new Error("React registry not initialized");
    }
    return reactRegistry;
  }

  return shiny.reactRegistry;
}

export { reactRegistry };
