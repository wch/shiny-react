/**
 * A reactive value container that notifies subscribers and update hooks when its value changes.
 *
 * This class provides a simple reactive data model with two types of listeners:
 * - Subscribers: External consumers that want to be notified of value changes
 * - Update hooks: Internal functions that should run as part of the value update lifecycle
 *
 * @template T The type of value being stored
 */
export class Value<T> {
  protected _value: T;
  protected _subscribers: Set<(value: T) => void> = new Set();
  protected _updateHooks: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  /**
   * Gets the current value.
   */
  getValue(): T {
    return this._value;
  }

  /**
   * Sets the value and notifies all subscribers and update hooks.
   * Subscribers are notified first, followed by update hooks.
   */
  setValue(value: T): void {
    this._value = value;
    this._subscribers.forEach((subscriber) => subscriber(value));
    this._updateHooks.forEach((hook) => hook(value));
  }

  /**
   * Adds a subscriber function that will be called whenever the value changes.
   * Subscribers are typically external consumers of the value.
   */
  subscribe(subscriber: (value: T) => void): void {
    this._subscribers.add(subscriber);
  }

  /**
   * Removes a previously added subscriber.
   */
  unsubscribe(subscriber: (value: T) => void): void {
    this._subscribers.delete(subscriber);
  }

  /**
   * Returns the number of active subscribers.
   */
  getSubscriberCount(): number {
    return this._subscribers.size;
  }

  /**
   * Adds an update hook that will be called as part of the value update lifecycle.
   * Update hooks are internal functions that should run when the value changes,
   * such as syncing with external systems or triggering side effects.
   */
  addUpdateHook(hook: (value: T) => void): void {
    this._updateHooks.add(hook);
  }

  /**
   * Removes a previously added update hook.
   */
  removeUpdateHook(hook: (value: T) => void): void {
    this._updateHooks.delete(hook);
  }

  /**
   * Manually invokes all update hooks with the current value.
   * This is useful when you need to trigger hooks without changing the value,
   * such as when external conditions change that affect hook behavior.
   */
  invokeUpdateHooks(): void {
    this._updateHooks.forEach((hook) => hook(this._value));
  }
}

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
export class ValueStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _values: Map<string, Value<any>> = new Map();

  /**
   * Retrieves a value by its key.
   *
   * **Warning:** The type parameter T must match the type used when the value
   * was originally stored. This method performs no runtime type checking.
   *
   * @param key The key to look up
   * @returns The value if found, undefined otherwise
   */
  get<T>(key: string): Value<T> | undefined {
    return this._values.get(key);
  }

  /**
   * Checks if a value exists for the given key.
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
  set<T>(key: string, value: Value<T>): void {
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
  getOrCreate<T>(key: string, initialValue: T, options?: {}): Value<T> {
    let value = this.get<T>(key);
    if (!value) {
      value = new Value<T>(initialValue);
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

let globalValueStore: ValueStore | undefined = undefined;

export function getValueStore(): ValueStore {
  if (!globalValueStore) {
    globalValueStore = new ValueStore();
  }
  return globalValueStore;
}
