/// <reference types="@posit/shiny" />

/**
 * Get the Shiny object if it is available
 */
export function getShiny(): typeof window.Shiny | undefined {
  return window.Shiny;
}
