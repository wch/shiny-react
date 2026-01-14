// Main exports for shiny-react JavaScript library
import { type ShinyClass } from "@posit/shiny/srcts/types/src/shiny";
import { type ShinyMessageRegistry } from "./message-registry";
import { type ShinyReactRegistry } from "./react-registry";

export { ImageOutput } from "./ImageOutput";
export { ShinyReactComponentElement } from "./ShinyReactComponentElement";
export {
  useShinyInitialized,
  useShinyInput,
  useShinyMessageHandler,
  useShinyOutput,
} from "./use-shiny";
export {
  ShinyModuleProvider,
  useShinyModuleNamespace,
} from "./ShinyModuleContext";

export type ShinyClassExtended = ShinyClass & {
  reactRegistry: ShinyReactRegistry;
  messageRegistry: ShinyMessageRegistry;
};

declare global {
  interface Window {
    Shiny?: ShinyClassExtended;
  }
}
