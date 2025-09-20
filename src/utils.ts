/**
 * Type definition for a debounced function with dynamic delay capabilities
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  setDelay: (newDelay: number) => void;
  getDelay: () => number;
  cancel: () => void;
};

/**
 * Creates a debounced function with dynamic delay that can be changed at runtime.
 *
 * @param func The function to debounce
 * @param delay The initial number of milliseconds to delay
 * @returns A debounced function with setDelay, getDelay, and cancel methods attached
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDebouncedFn<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedFunction = function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, delay);
  } as DebouncedFunction<T>;

  debouncedFunction.setDelay = (newDelay: number) => {
    delay = newDelay;
  };

  debouncedFunction.getDelay = () => delay;

  debouncedFunction.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFunction;
}
