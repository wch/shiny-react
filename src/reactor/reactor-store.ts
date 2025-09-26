import { Reactor } from "./reactor";

/**
 * A store that manages a collection of Value instances by key.
 *
 * This class provides a centralized way to manage multiple reactive values,
 * typically used for managing application state or input/output bindings.
 * Values are stored by string keys and can be retrieved, created, or removed as
 * needed.
 *
 * **Type Safety Contract:** This store does not enforce type consistency at
 * runtime. It is the caller's responsibility to ensure that the same type T is
 * used when setting and getting values for the same key. Using different types
 * for the same key will result in runtime type errors.
 *
 * @example
 * ```typescript
 * const store = new ValueStore();
 *
 * // Correct usage - consistent types
 * store.set("count", new Value<number>(0));
 * const count = store.get<number>("count"); // Safe
 *
 * // Incorrect usage - inconsistent types
 * store.set("count", new Value<number>(0));
 * const count = store.get<string>("count"); // Compiles but unsafe!
 * ```
 */
export class ReactorStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _values: Map<string, Reactor<any>> = new Map();

  /**
   * Retrieves a Reactor by its key.
   *
   * **Warning:** The type parameter T must match the type used when the value
   * was originally stored. This method performs no runtime type checking.
   *
   * @param key The key to look up
   * @returns The value if found, undefined otherwise
   */
  get<T>(key: string): Reactor<T> | undefined {
    return this._values.get(key);
  }

  /**
   * Checks if a Reactor exists for the given key.
   */
  has(key: string): boolean {
    return this._values.has(key);
  }

  /**
   * Stores a value with the given key.
   *
   * @param key The key to store the value under
   * @param value The Value instance to store
   */
  set<T>(key: string, value: Reactor<T>): void {
    this._values.set(key, value);
  }

  /**
   * Gets an existing value or creates a new one if it doesn't exist.
   *
   * **Type Safety:** If a value already exists for the key, the caller must
   * ensure that the type T matches the type of the existing value. This method
   * performs no runtime type checking on existing values.
   *
   * @param key The key to look up or create
   * @param initialValue The initial value to use if creating a new Value
   * @param options Optional configuration (unused in base implementation)
   * @returns The existing or newly created value
   */
  getOrCreate<T>(key: string, initialValue: T, options?: {}): Reactor<T> {
    let value = this.get<T>(key);
    if (!value) {
      value = new Reactor<T>(initialValue);
      this.set(key, value);
    }
    return value;
  }

  /**
   * Removes a value from the store.
   * @returns true if the value was removed, false if it didn't exist
   */
  remove(key: string): boolean {
    return this._values.delete(key);
  }

  /**
   * Returns an iterator of all keys in the store.
   */
  keys(): IterableIterator<string> {
    return this._values.keys();
  }

  /**
   * Returns the number of values in the store.
   */
  size(): number {
    return this._values.size;
  }

  /**
   * Removes all values from the store.
   */
  clear(): void {
    this._values.clear();
  }
}

let globalValueStore: ReactorStore | undefined = undefined;

export function getReactorStore(): ReactorStore {
  if (!globalValueStore) {
    globalValueStore = new ReactorStore();
  }
  return globalValueStore;
}
