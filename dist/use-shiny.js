import { useCallback, useEffect, useState } from "react";
import { debounce } from "./utils";
function useShinyInput(id, defaultValue, {
  debounceMs = 100,
  priority
} = {}) {
  const [value, setValue] = useState(defaultValue);
  const shinyInitialized = useShinyInitialized();
  useEffect(() => {
    if (!shinyInitialized) {
      return;
    }
    if (id in window.Shiny.reactRegistry.inputs) {
      return;
    }
    window.Shiny.reactRegistry.registerInput(id, setValue, {
      debounceMs,
      priority
    });
    window.Shiny.reactRegistry.setInputValue(id, value);
  }, [id, shinyInitialized, debounceMs, priority, value]);
  const setValueWrapped = useCallback(
    (value2) => {
      if (!shinyInitialized) {
        return;
      }
      window.Shiny.reactRegistry.setInputValue(id, value2);
    },
    [shinyInitialized, id]
  );
  return [value, setValueWrapped];
}
function useShinyOutput(outputId, defaultValue = void 0) {
  const [value, setValue] = useState(defaultValue);
  const [recalculating, setRecalculating] = useState(false);
  const shinyInitialized = useShinyInitialized();
  useEffect(() => {
    if (!shinyInitialized) {
      return;
    }
    window.Shiny.reactRegistry.registerOutput(
      outputId,
      setValue,
      setRecalculating
    );
  }, [outputId, shinyInitialized]);
  return [value, recalculating];
}
class ReactOutputBinding extends window.Shiny.OutputBinding {
  find(scope) {
    return $(scope).find(".react-shiny-output");
  }
  renderValue(el, data) {
    window.Shiny.reactRegistry.outputs[el.id].setValueFns.forEach(
      (fn) => fn(data)
    );
  }
  renderError(el, err) {
    console.log(`Error for ${el.id}: ${err}`);
  }
  showProgress(el, show) {
    window.Shiny.reactRegistry.outputs[el.id].setRecalculatingFns.forEach(
      (fn) => fn(show)
    );
  }
}
window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput"
);
class ShinyReactRegistry {
  inputs = {};
  outputs = {};
  bindAllScheduled = false;
  constructor() {
    window.Shiny.addCustomMessageHandler("shinyReactSetInputs", (msg) => {
      for (const [inputId, value] of Object.entries(msg)) {
        if (this.inputs[inputId]) {
          this.setInputValue(inputId, value);
        }
      }
    });
  }
  registerInput(inputId, setValueFn, opts = {}) {
    const { debounceMs = 100 } = opts;
    const setInputValueOpts = {};
    if (opts.priority) {
      setInputValueOpts.priority = opts.priority;
    }
    if (!this.inputs[inputId]) {
      this.inputs[inputId] = {
        id: inputId,
        setValueFns: [],
        shinySetInputValueDebounced: debounce((value) => {
          window.Shiny.setInputValue(inputId, value, setInputValueOpts);
        }, debounceMs)
      };
    }
    this.inputs[inputId].setValueFns.push(setValueFn);
  }
  registerOutput(outputId, setValue, setRecalculating) {
    if (!this.outputs[outputId]) {
      const div = document.createElement("div");
      div.className = "react-shiny-output";
      div.id = outputId;
      div.textContent = `This is the output div for ${outputId}`;
      div.style.visibility = "hidden";
      document.body.appendChild(div);
      this.outputs[outputId] = {
        id: outputId,
        setValueFns: [],
        setRecalculatingFns: []
      };
      this.scheduleBindAll();
    }
    this.outputs[outputId].setValueFns.push(setValue);
    this.outputs[outputId].setRecalculatingFns.push(setRecalculating);
  }
  /**
   * Schedules a Shiny binding operation to run after DOM updates are complete.
   *
   * Note: I'm not sure if this is 100% reliable. I believe we need to avoid
   * overlapping calls to bindAll(), and am not sure if requestAnimationFrame()
   * will provide perfect reliability for this.
   */
  scheduleBindAll() {
    if (this.bindAllScheduled) {
      return;
    }
    this.bindAllScheduled = true;
    requestAnimationFrame(() => {
      window.Shiny.unbindAll?.(document.body);
      window.Shiny.bindAll?.(document.body);
      this.bindAllScheduled = false;
    });
  }
  hasInput(inputId) {
    return this.inputs[inputId] !== void 0;
  }
  setInputValue(inputId, value, opts) {
    if (!this.inputs[inputId]) {
      console.error(`Input ${inputId} not found`);
      return;
    }
    this.inputs[inputId].shinySetInputValueDebounced(value, opts);
    this.inputs[inputId].setValueFns.forEach((fn) => fn(value));
  }
  hasOutput(outputId) {
    return this.outputs[outputId] !== void 0;
  }
}
window.Shiny.reactRegistry = new ShinyReactRegistry();
function useShinyInitialized() {
  const [shinyInitialized, setShinyInitialized] = useState(false);
  useEffect(() => {
    window.Shiny.initializedPromise.then(() => {
      setShinyInitialized(true);
    });
  }, []);
  return shinyInitialized;
}
export {
  ReactOutputBinding,
  useShinyInitialized,
  useShinyInput,
  useShinyOutput
};
//# sourceMappingURL=use-shiny.js.map
