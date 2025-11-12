/**
 * Flow Tracker Utility (T036)
 *
 * This utility manages the active quote flow type using sessionStorage.
 * It helps track whether the user is in the classic or tech-startup flow.
 *
 * WHY SESSION STORAGE?
 * - Persists across page refreshes within the same tab
 * - Automatically cleared when tab/browser closes
 * - Scoped to the current session (perfect for quote flows)
 * - Synchronous API (no async/await needed)
 *
 * WHAT IS SESSION STORAGE?
 * Think of it like sticky notes on your browser tab:
 * - Write a note (setItem)
 * - Read the note (getItem)
 * - Remove the note (removeItem)
 * - Close the tab = all notes disappear
 *
 * vs. LOCAL STORAGE:
 * - localStorage persists forever (until manually cleared)
 * - sessionStorage persists only during tab session
 * - For quote flows, we want sessionStorage (temporary data)
 */

/**
 * Flow type definition
 */
export type QuoteFlowType = 'classic' | 'tech-startup' | null;

/**
 * Session storage key for active flow
 * Prefixed with project name to avoid conflicts
 */
const STORAGE_KEY = 'active_quote_flow';

/**
 * Set the active quote flow
 *
 * Usage:
 * ```typescript
 * setActiveFlow('tech-startup'); // User started tech-startup flow
 * setActiveFlow('classic');      // User started classic flow
 * setActiveFlow(null);           // User exited flow
 * ```
 *
 * @param flow - The flow type to set ('classic', 'tech-startup', or null)
 */
export function setActiveFlow(flow: QuoteFlowType): void {
  try {
    if (flow === null) {
      // Remove from storage if null
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      // Store as string (sessionStorage only stores strings)
      sessionStorage.setItem(STORAGE_KEY, flow);
    }
  } catch (error) {
    // Handle potential storage errors (e.g., quota exceeded, disabled cookies)
    console.error('[flowTracker] Error setting active flow:', error);
  }
}

/**
 * Get the active quote flow
 *
 * Usage:
 * ```typescript
 * const currentFlow = getActiveFlow();
 * if (currentFlow === 'tech-startup') {
 *   // Show tech-startup UI
 * }
 * ```
 *
 * @returns The current active flow, or null if no flow is active
 */
export function getActiveFlow(): QuoteFlowType {
  try {
    const flow = sessionStorage.getItem(STORAGE_KEY);

    // Validate the stored value
    if (flow === 'classic' || flow === 'tech-startup') {
      return flow;
    }

    // Return null if no valid flow found
    return null;
  } catch (error) {
    // Handle potential storage errors
    console.error('[flowTracker] Error getting active flow:', error);
    return null;
  }
}

/**
 * Clear the active quote flow
 *
 * Usage:
 * ```typescript
 * clearActiveFlow(); // User completed or abandoned the flow
 * ```
 *
 * This is equivalent to setActiveFlow(null), but more explicit
 */
export function clearActiveFlow(): void {
  setActiveFlow(null);
}

/**
 * Check if a specific flow is active
 *
 * Usage:
 * ```typescript
 * if (isFlowActive('tech-startup')) {
 *   // Tech-startup flow is active
 * }
 * ```
 *
 * @param expectedFlow - The flow to check
 * @returns true if the expected flow is active, false otherwise
 */
export function isFlowActive(expectedFlow: 'classic' | 'tech-startup'): boolean {
  return getActiveFlow() === expectedFlow;
}

/**
 * ============================================================================
 * LEARNING SUMMARY: SESSION STORAGE
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. WEB STORAGE API
 *    - Browser-provided storage for key-value pairs
 *    - Two types: localStorage and sessionStorage
 *    - Synchronous API (no promises/async)
 *
 * 2. SESSION STORAGE
 *    - Scoped to browser tab/window
 *    - Cleared when tab closes
 *    - Survives page refreshes
 *    - ~5-10MB storage limit
 *
 * 3. LOCAL STORAGE
 *    - Persistent storage (never expires)
 *    - Shared across all tabs (same origin)
 *    - Must manually clear
 *    - Same ~5-10MB limit
 *
 * 4. STORAGE METHODS
 *    - setItem(key, value) - Store a value
 *    - getItem(key) - Retrieve a value
 *    - removeItem(key) - Delete a value
 *    - clear() - Delete all values
 *
 * 5. STRING ONLY
 *    - Web Storage only stores strings
 *    - Must use JSON.stringify() for objects
 *    - Must use JSON.parse() when retrieving objects
 *
 * ANALOGIES:
 *
 * - sessionStorage = Post-it Notes on Your Desk
 *   - Write quick notes
 *   - Only you can see them (your tab)
 *   - Thrown away when you leave (close tab)
 *
 * - localStorage = Filing Cabinet
 *   - Permanent storage
 *   - Everyone in the office can access (all tabs)
 *   - Must manually throw away documents
 *
 * - Flow Tracker = Traffic Light State
 *   - Tracks which flow is "green" (active)
 *   - Prevents users from mixing flows
 *   - Cleared when session ends
 *
 * BEST PRACTICES:
 *
 * 1. Try/Catch Storage Operations
 *    - Storage can be disabled (privacy mode)
 *    - Quota can be exceeded
 *    - Always handle errors
 *
 * 2. Use Constants for Keys
 *    - Prevent typos
 *    - Easy to update
 *    - Self-documenting
 *
 * 3. Validate Retrieved Values
 *    - Storage can be tampered with
 *    - Values can be corrupted
 *    - Always validate types
 *
 * 4. Choose Right Storage Type
 *    - Temporary data ’ sessionStorage
 *    - Persistent preferences ’ localStorage
 *    - Sensitive data ’ Neither (use server)
 */
