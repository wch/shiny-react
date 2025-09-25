import { type ShinyClassExtended } from "./index";

/**
 * Get the Shiny object if it is available
 */
export function getShiny(): ShinyClassExtended | undefined {
  return window.Shiny;
}
