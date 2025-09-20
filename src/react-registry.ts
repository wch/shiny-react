/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputRegistry } from "./input-registry";

type ErrorsMessageValue = {
  message: string;
  call: string[];
  type?: string[];
};

type OutputRegistryEntry = {
  id: string; // Output ID
  useStateSetValueFns: Set<(value: any) => void>;
  useStateSetRecalculatingFns: Set<(value: boolean) => void>;
};

type OutputMap = Map<string, OutputRegistryEntry>;

export class ShinyReactRegistry {
  inputs: InputRegistry = new InputRegistry();
  outputs: OutputMap = new Map();
  private bindAllScheduled = false;

  registerOutput<T>(
    outputId: string,
    setValue: (value: T) => void,
    setRecalculating: (value: boolean) => void,
  ) {
    if (!this.outputs.has(outputId)) {
      // Need to create a dummy div element with the ID, so that we have
      // something to bind to.
      const div = document.createElement("div");
      div.className = "react-shiny-output";
      div.id = outputId;
      div.textContent = `This is the output div for ${outputId}`;
      // Will display: none make the output not work?
      div.style.visibility = "hidden";
      document.body.appendChild(div);

      this.outputs.set(outputId, {
        id: outputId,
        useStateSetValueFns: new Set(),
        useStateSetRecalculatingFns: new Set(),
      });

      this.scheduleBindAll();
    }

    this.outputs.get(outputId)!.useStateSetValueFns.add(setValue);
    this.outputs
      .get(outputId)!
      .useStateSetRecalculatingFns.add(setRecalculating);
  }

  /**
   * Schedules a Shiny binding operation to run after DOM updates are complete.
   *
   * Note: I'm not sure if this is 100% reliable. I believe we need to avoid
   * overlapping calls to bindAll(), and am not sure if requestAnimationFrame()
   * will provide perfect reliability for this.
   */
  private scheduleBindAll() {
    if (this.bindAllScheduled) {
      return;
    }

    this.bindAllScheduled = true;

    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      window.Shiny.unbindAll?.(document.body);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      window.Shiny.bindAll?.(document.body);
      this.bindAllScheduled = false;
    });
  }

  hasOutput(outputId: string) {
    return this.outputs.has(outputId);
  }
}

window.Shiny.reactRegistry = new ShinyReactRegistry();

export class ReactOutputBinding extends window.Shiny.OutputBinding {
  override find(scope: HTMLElement | JQuery<HTMLElement>): JQuery<HTMLElement> {
    return $(scope).find(".react-shiny-output");
  }

  override renderValue(el: HTMLElement, data: any): void {
    if (!window.Shiny.reactRegistry.outputs.has(el.id)) {
      console.error(`Output ${el.id} not found`);
      return;
    }
    window.Shiny.reactRegistry.outputs
      .get(el.id)!
      .useStateSetValueFns.forEach((fn) => fn(data));
  }

  override renderError(el: HTMLElement, err: ErrorsMessageValue): void {
    console.log(`Error for ${el.id}: ${err}`);
  }

  override showProgress(el: HTMLElement, show: boolean): void {
    // console.log(`Progress for ${el.id}: ${show}`);
    if (!window.Shiny.reactRegistry.outputs.has(el.id)) {
      console.error(`Output ${el.id} not found`);
      return;
    }
    window.Shiny.reactRegistry.outputs
      .get(el.id)!
      .useStateSetRecalculatingFns.forEach((fn) => fn(show));
  }
}

window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput",
);
