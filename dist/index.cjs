"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ImageOutput: () => ImageOutput,
  useShinyInput: () => useShinyInput,
  useShinyOutput: () => useShinyOutput
});
module.exports = __toCommonJS(index_exports);

// src/use-shiny.ts
var import_react = require("react");

// src/utils.ts
function debounce(func, wait) {
  let timeout = null;
  return function(...args) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// src/use-shiny.ts
function useShinyInput(id, defaultValue, {
  debounceMs = 100,
  priority
} = {}) {
  const [value, setValue] = (0, import_react.useState)(defaultValue);
  const shinyInitialized = useShinyInitialized();
  (0, import_react.useEffect)(() => {
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
  const setValueWrapped = (0, import_react.useCallback)(
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
  const [value, setValue] = (0, import_react.useState)(defaultValue);
  const [recalculating, setRecalculating] = (0, import_react.useState)(false);
  const shinyInitialized = useShinyInitialized();
  (0, import_react.useEffect)(() => {
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
var ReactOutputBinding = class extends window.Shiny.OutputBinding {
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
};
window.Shiny.outputBindings.register(
  new ReactOutputBinding(),
  "shiny.reactOutput"
);
var ShinyReactRegistry = class {
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
};
window.Shiny.reactRegistry = new ShinyReactRegistry();
function useShinyInitialized() {
  const [shinyInitialized, setShinyInitialized] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    window.Shiny.initializedPromise.then(() => {
      setShinyInitialized(true);
    });
  }, []);
  return shinyInitialized;
}

// src/ImageOutput.tsx
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function ImageOutput({
  id,
  className
}) {
  const [imgWidth, setImgWidth] = useShinyInput(
    ".clientdata_output_" + id + "_width",
    null
  );
  const [imgHeight, setImgHeight] = useShinyInput(
    ".clientdata_output_" + id + "_height",
    null
  );
  const [imgHidden] = useShinyInput(
    ".clientdata_output_" + id + "_hidden",
    false
  );
  const [imgData, imgRecalculating] = useShinyOutput(id, void 0);
  const imgRef = (0, import_react2.useRef)(null);
  const [imageVersion, setImageVersion] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
    if (imgData) {
      setImageVersion((prev) => prev + 1);
    }
  }, [imgData]);
  const handleImageLoad = () => {
    if (imgRef.current) {
      const width = imgRef.current.clientWidth;
      const height = imgRef.current.clientHeight;
      console.log("Image loaded - Width:", width, "Height:", height);
      setImgWidth(width);
      setImgHeight(height);
    }
  };
  (0, import_react2.useEffect)(() => {
    console.log("Image dimensions changed");
    const img = imgRef.current;
    if (!img) return;
    img.addEventListener("load", handleImageLoad);
    const debouncedHandleResize = debounce(() => {
      if (img && img.complete) {
        handleImageLoad();
      }
    }, 400);
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === img) {
          debouncedHandleResize();
        }
      }
    });
    resizeObserver.observe(img);
    return () => {
      img.removeEventListener("load", handleImageLoad);
      resizeObserver.disconnect();
    };
  }, [imgRef, imageVersion, setImgWidth, setImgHeight]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "img",
    {
      ref: imgRef,
      src: imgData?.src,
      alt: "",
      className,
      style: {
        width: "100%",
        height: "300px",
        display: imgHidden ? "none" : "block",
        opacity: imgRecalculating ? 0.4 : 1
      },
      onLoad: handleImageLoad
    }
  );
}
//# sourceMappingURL=index.cjs.map
