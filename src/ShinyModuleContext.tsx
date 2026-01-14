import { createContext, useContext, type ReactNode } from "react";

const ShinyModuleContext = createContext<string | null>(null);

export interface ShinyModuleProviderProps {
  namespace: string;
  children: ReactNode;
}

/**
 * Provides a namespace context for Shiny module support.
 *
 * All child components using useShinyInput, useShinyOutput, or
 * useShinyMessageHandler will automatically have their IDs prefixed
 * with the provided namespace.
 *
 * Note: This provider does NOT support nesting. If you need nested modules,
 * pass the full namespace string (e.g., "outer-inner") directly.
 *
 * @param namespace The complete namespace string to apply to child hooks.
 * @param children React children that will receive the namespace context.
 *
 * @example
 * ```tsx
 * <ShinyModuleProvider namespace="myModule">
 *   <MyComponent /> {/* useShinyInput("x") becomes "myModule-x" *}
 * </ShinyModuleProvider>
 * ```
 */
export function ShinyModuleProvider({
  namespace,
  children,
}: ShinyModuleProviderProps) {
  return (
    <ShinyModuleContext.Provider value={namespace}>
      {children}
    </ShinyModuleContext.Provider>
  );
}

/**
 * Hook to access the current module namespace from context.
 * Returns null if not within a ShinyModuleProvider.
 */
export function useShinyModuleNamespace(): string | null {
  return useContext(ShinyModuleContext);
}

/**
 * Utility function to apply namespace to an ID.
 * If namespace is provided, returns `${namespace}-${id}`.
 * Otherwise returns the original id.
 */
export function applyNamespace(id: string, namespace: string | null): string {
  if (namespace) {
    return `${namespace}-${id}`;
  }
  return id;
}
