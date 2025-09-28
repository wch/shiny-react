/**
 * A reactive value container that notifies subscribers and update hooks when
 * its value changes.
 *
 * This class provides a simple reactive data model with two types of listeners:
 * - Subscribers: External consumers that want to be notified of value changes
 * - Update hooks: Internal functions that should run as part of the value
 *   update lifecycle
 *
 * @template T The type of value being stored
 */
export class Reactor<T> {
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
   * Errors in individual subscribers/hooks are caught to prevent cascade failures.
   */
  setValue(value: T): void {
    this._value = value;

    // Notify subscribers
    this._subscribers.forEach((subscriber) => {
      try {
        subscriber(value);
      } catch (error) {
        console.error(`[Reactor] Error in subscriber for value update:`, error);
        console.error(`[Reactor] Current value:`, value);
        console.error(`[Reactor] Subscriber function:`, subscriber.toString());
      }
    });

    this.invokeUpdateHooks();
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
   * Errors in individual hooks are caught to prevent cascade failures.
   */
  invokeUpdateHooks(): void {
    this._updateHooks.forEach((hook) => {
      try {
        hook(this._value);
      } catch (error) {
        console.error(`[Reactor] Error in update hook:`, error);
        console.error(`[Reactor] Current value:`, this._value);
        console.error(`[Reactor] Hook function:`, hook.toString());
      }
    });
  }
}
