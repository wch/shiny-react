/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputRegistry } from "./input-registry";
import { OutputRegistry } from "./output-registry";

export interface ShinyReactRegistry {
  inputs: InputRegistry;
  outputs: OutputRegistry;
}

window.Shiny.reactRegistry = {
  inputs: new InputRegistry(),
  outputs: new OutputRegistry(),
};
