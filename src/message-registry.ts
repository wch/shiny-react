/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * ShinyMessageRegistry manages custom message handlers for React components.
 *
 * This registry provides a centralized system for handling custom messages from
 * the Shiny server, with proper React lifecycle management including automatic
 * cleanup when components unmount.
 *
 * The registry uses a single dispatcher pattern where all messages are sent to
 * "shinyReactMessage" and then routed to the appropriate handlers based on
 * type. This allows multiple components to listen to the same message type and
 * ensures proper cleanup when handlers are no longer needed.
 */
class ShinyMessageRegistry {
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private initialized = false;

  /**
   * Initialize the message registry by registering the single dispatcher
   * with Shiny's custom message handler system.
   */
  init() {
    if (this.initialized) {
      return;
    }

    // Register single dispatcher for all React custom messages
    window.Shiny.addCustomMessageHandler(
      "shinyReactMessage",
      (msg: { type: string; data: any }) => {
        this.dispatchMessage(msg.type, msg.data);
      }
    );

    this.initialized = true;
  }

  /**
   * Add a message handler for the specified message type.
   *
   * @param messageType The type/name of the message to listen for
   * @param handler The function to call when a message of this type is received
   */
  addHandler(messageType: string, handler: (data: any) => void) {
    this.init(); // Ensure registry is initialized

    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);
  }

  /**
   * Remove a message handler for the specified message type.
   *
   * @param messageType The type/name of the message
   * @param handler The handler function to remove
   */
  removeHandler(messageType: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(messageType);
      }
    }
  }

  /**
   * Dispatch a message to all registered handlers for the given type.
   *
   * @param messageType The type of message to dispatch
   * @param data The message data to pass to handlers
   */
  private dispatchMessage(messageType: string, data: any) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Get the number of handlers registered for a specific message type.
   * Useful for debugging and testing.
   *
   * @param messageType The message type to check
   * @returns The number of handlers registered for this type
   */
  getHandlerCount(messageType: string): number {
    const handlers = this.messageHandlers.get(messageType);
    return handlers ? handlers.size : 0;
  }

  /**
   * Get all message types that currently have registered handlers.
   * Useful for debugging and testing.
   *
   * @returns Array of message types with active handlers
   */
  getActiveMessageTypes(): string[] {
    return Array.from(this.messageHandlers.keys());
  }
}

// Global message registry instance
const messageRegistry = new ShinyMessageRegistry();

// Note: Global Window interface is extended in use-shiny.ts to avoid conflicts

// Make the registry available globally
window.Shiny.messageRegistry = messageRegistry;

export { ShinyMessageRegistry, messageRegistry };
