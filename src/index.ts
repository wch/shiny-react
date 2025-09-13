// Main exports for shiny-react JavaScript library
import { type ShinyClass } from "@posit/shiny/srcts/types/src/shiny";
import { type ShinyMessageRegistry } from "./message-registry";
import { type ShinyReactRegistry } from "./react-registry";

export { ImageOutput } from "./ImageOutput";
export {
  useShinyInput,
  useShinyMessageHandler,
  useShinyOutput,
} from "./use-shiny";

declare global {
  interface Window {
    Shiny: ShinyClass & {
      reactRegistry: ShinyReactRegistry;
      messageRegistry: ShinyMessageRegistry;
    };
  }
}
