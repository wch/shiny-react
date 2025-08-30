import { type EventPriority } from "rstudio-shiny/srcts/types/src/inputPolicies";
import { type ShinyClass } from "rstudio-shiny/srcts/types/src/shiny";
/**
 * A React hook for managing a Shiny input value.
 *
 * This hook initializes a state variable with `defaultValue` and returns the
 * current value and a function to update it, similar to `React.useState`.
 *
 * When the component mounts, it waits for Shiny to initialize. Once Shiny is
 * initialized, this hook registers the input with the Shiny React registry and
 * uses debounced updates to send values to the Shiny server via
 * `window.Shiny.setInputValue()`.
 *
 * The hook supports debouncing to optimize performance by batching rapid
 * updates, and allows setting priority levels for input events.
 *
 * Note: This hook only sends data *to* Shiny. It does not automatically update
 * the React state if the input is changed on the server-side (e.g., using
 * `updateTextInput()`). For two-way binding, a custom Shiny input binding would
 * be required.
 *
 * @param id The ID that will be used for the Shiny input (`input$<id>`).
 * @param defaultValue The initial value for the input.
 * @param options Optional configuration object.
 * @param options.debounceMs Debounce delay in milliseconds for input updates
 * (default: 100).
 * @param options.priority Priority level for the input event (from Shiny's
 * EventPriority enum).
 * @returns A tuple containing the current value and a function to set the
 * value: `[value, setValue]`.
 */
export declare function useShinyInput<T>(id: string, defaultValue: T, { debounceMs, priority, }?: {
    debounceMs?: number;
    priority?: EventPriority;
}): [T, (value: T) => void];
/**
 * Hook to receive and subscribe to Shiny output values from the server. Creates
 * a hidden DOM element and registers a custom Shiny output binding to receive
 * reactive data updates for the specified outputId.
 *
 * @param outputId The ID of the Shiny output to subscribe to.
 * @param defaultValue Optional default value to use before the first server
 * update.
 * @returns A tuple containing [value, recalculating] where:
 *   - value: The current value of the Shiny output
 *   - recalculating: Boolean indicating if the server is currently
 *     recalculating this output
 */
export declare function useShinyOutput<T>(outputId: string, defaultValue?: T | undefined): [T | undefined, boolean];
export declare class ReactOutputBinding extends window.Shiny.OutputBinding {
    find(scope: HTMLElement | JQuery<HTMLElement>): JQuery<HTMLElement>;
    renderValue(el: HTMLElement, data: any): void;
    renderError(el: HTMLElement, err: ErrorsMessageValue): void;
    showProgress(el: HTMLElement, show: boolean): void;
}
type ErrorsMessageValue = {
    message: string;
    call: string[];
    type?: string[];
};
type InputMap = {
    [key: string]: {
        id: string;
        setValueFns: Array<(value: any) => void>;
        shinySetInputValueDebounced: (value: any, opts?: {
            priority?: EventPriority;
        }) => void;
    };
};
type OutputMap = {
    [key: string]: {
        id: string;
        setValueFns: Array<(value: any) => void>;
        setRecalculatingFns: Array<(value: boolean) => void>;
    };
};
declare class ShinyReactRegistry {
    inputs: InputMap;
    outputs: OutputMap;
    private bindAllScheduled;
    constructor();
    registerInput(inputId: string, setValueFn: (value: any) => void, opts?: {
        priority?: EventPriority;
        debounceMs?: number;
    }): void;
    registerOutput(outputId: string, setValue: (value: any) => void, setRecalculating: (value: boolean) => void): void;
    /**
     * Schedules a Shiny binding operation to run after DOM updates are complete.
     *
     * Note: I'm not sure if this is 100% reliable. I believe we need to avoid
     * overlapping calls to bindAll(), and am not sure if requestAnimationFrame()
     * will provide perfect reliability for this.
     */
    private scheduleBindAll;
    hasInput(inputId: string): boolean;
    setInputValue(inputId: string, value: any, opts?: {
        priority?: EventPriority;
    }): void;
    hasOutput(outputId: string): boolean;
}
declare global {
    interface Window {
        Shiny: ShinyClass & {
            reactRegistry: ShinyReactRegistry;
        };
    }
}
/**
 * A React hook that tracks whether Shiny has been initialized.
 *
 * @returns A boolean indicating whether Shiny has been initialized.
 */
export declare function useShinyInitialized(): boolean;
export {};
//# sourceMappingURL=use-shiny.d.ts.map