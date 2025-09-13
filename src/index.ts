// Main exports for shiny-react JavaScript library
import { type ShinyClass } from "@posit/shiny/srcts/types/src/shiny";
import { type ShinyReactRegistry } from "./react-registry";
import { type ShinyMessageRegistry } from "./shiny-message";
export { ImageOutput } from "./ImageOutput";
export {
  type ReactOutputBinding,
  type ShinyReactRegistry,
} from "./react-registry";
export { type ShinyMessageRegistry } from "./shiny-message";
export { useShinyInput, useShinyMessage, useShinyOutput } from "./use-shiny";

declare global {
  interface Window {
    Shiny: ShinyClass & {
      reactRegistry: ShinyReactRegistry;
      messageRegistry: ShinyMessageRegistry;
    };
  }
}
