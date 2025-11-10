/**
 * RouteGuard Component (T037)
 *
 * This component protects quote flow routes from unauthorized access.
 * It ensures users can't jump between classic and tech-startup flows.
 *
 * WHAT IS A ROUTE GUARD?
 * A route guard is like a bouncer at a club:
 * - Checks if you have the right credentials (active flow)
 * - Lets you in if valid
 * - Redirects you away if invalid
 *
 * WHY DO WE NEED THIS?
 * - Prevent flow mixing (classic users shouldn't see tech-startup screens)
 * - Enforce proper flow entry (must start from homepage)
 * - Better UX (clear error messages if user bookmarks a flow page)
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveFlow, QuoteFlowType } from '../utils/flowTracker';

/**
 * RouteGuard Props
 */
interface RouteGuardProps {
  /** Expected flow type for this route */
  expectedFlow: 'classic' | 'tech-startup';
  /** Child components to render if guard passes */
  children: React.ReactNode;
  /** Optional custom redirect path (defaults to '/') */
  redirectTo?: string;
  /** Optional custom error message */
  errorMessage?: string;
}

/**
 * RouteGuard Component
 *
 * Usage:
 * ```typescript
 * // In App.tsx
 * <Route
 *   path="/quote-v2/basic-info"
 *   element={
 *     <RouteGuard expectedFlow="tech-startup">
 *       <BasicInfo />
 *     </RouteGuard>
 *   }
 * />
 * ```
 *
 * How it works:
 * 1. On mount, checks activeFlow from sessionStorage
 * 2. If activeFlow matches expectedFlow → renders children
 * 3. If no activeFlow or mismatch → redirects to home with error
 * 4. Uses useEffect to run check on every route change
 *
 * @param props - Component props
 * @returns Protected route content or null (during redirect)
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  expectedFlow,
  children,
  redirectTo = '/',
  errorMessage = 'Please start a new quote from the homepage.',
}) => {
  /**
   * React Router hooks
   */
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Guard Check Effect
   *
   * This effect runs:
   * - On component mount
   * - When location changes (user navigates)
   * - When expectedFlow changes (unlikely but handled)
   *
   * WHY useEffect?
   * - Can't navigate during render (causes React warning)
   * - Need to wait for component to mount
   * - Navigation is a side effect
   */
  useEffect(() => {
    // Get current active flow from sessionStorage
    const activeFlow: QuoteFlowType = getActiveFlow();

    /**
     * Guard Logic
     *
     * Case 1: No active flow
     * - User directly accessed URL (bookmark/manual entry)
     * - User's session expired
     * → Redirect to home with error
     *
     * Case 2: Flow mismatch
     * - User started classic flow but accessed tech-startup URL
     * - User started tech-startup flow but accessed classic URL
     * → Redirect to home with error
     *
     * Case 3: Flow matches
     * - User is in correct flow
     * → Render children (allow access)
     */
    if (!activeFlow || activeFlow !== expectedFlow) {
      console.warn(
        `[RouteGuard] Access denied to ${location.pathname}. ` +
        `Expected flow: ${expectedFlow}, Active flow: ${activeFlow || 'none'}`
      );

      /**
       * Navigate to redirect path
       *
       * Pass state with error message so homepage can display it
       * Using replace: true removes this page from history
       * (prevents back button from returning to guarded page)
       */
      navigate(redirectTo, {
        replace: true,
        state: {
          error: errorMessage,
          attemptedPath: location.pathname,
          expectedFlow,
          activeFlow,
        },
      });
    }
  }, [location.pathname, expectedFlow, navigate, redirectTo, errorMessage]);

  /**
   * Get current active flow (for render decision)
   */
  const activeFlow = getActiveFlow();

  /**
   * Render Logic
   *
   * Only render children if flow matches
   * Otherwise return null (during redirect)
   */
  if (!activeFlow || activeFlow !== expectedFlow) {
    return null;
  }

  /**
   * ACCESSIBILITY NOTE:
   * This component doesn't need ARIA labels because it's not
   * a visible UI element - it's a logical wrapper.
   *
   * The redirect message should be announced by the homepage
   * using an ARIA live region.
   */
  return <>{children}</>;
};

/**
 * ============================================================================
 * LEARNING SUMMARY: ROUTE GUARDS
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. ROUTE PROTECTION
 *    - Control access to specific routes
 *    - Validate user state before rendering
 *    - Redirect invalid access attempts
 *
 * 2. REACT ROUTER HOOKS
 *    - useNavigate() - Programmatic navigation
 *    - useLocation() - Current route information
 *    - navigate(path, options) - Navigate to path
 *
 * 3. USEEFFECT FOR SIDE EFFECTS
 *    - Navigation is a side effect
 *    - Can't navigate during render
 *    - useEffect runs after render
 *
 * 4. REACT ROUTER STATE
 *    - Pass data through navigation
 *    - Accessible via location.state
 *    - Good for error messages, context
 *
 * 5. REPLACE VS PUSH
 *    - navigate(path) = push to history (back button works)
 *    - navigate(path, { replace: true }) = replace current entry (back button skips)
 *    - Use replace for guards (don't want user going back to guarded page)
 *
 * ANALOGIES:
 *
 * - RouteGuard = Security Checkpoint
 *   - Check credentials (activeFlow)
 *   - Allow or deny entry
 *   - Log attempts
 *
 * - useEffect = Security Camera
 *   - Monitors changes (location, flow)
 *   - Triggers alerts (navigation)
 *   - Runs after event occurs (mount, update)
 *
 * - navigate with state = Passing a Note
 *   - Guard writes note (error message)
 *   - Homepage reads note (displays error)
 *   - State travels with navigation
 *
 * BEST PRACTICES:
 *
 * 1. Centralize Guard Logic
 *    - One component for all routes
 *    - Consistent behavior
 *    - Easy to update
 *
 * 2. Log Guard Events
 *    - Console.warn for denied access
 *    - Include context (expected vs actual)
 *    - Helps debugging
 *
 * 3. Use Replace for Guards
 *    - Prevents back button to guarded page
 *    - Better UX
 *    - Cleaner history
 *
 * 4. Pass Context in State
 *    - Error message
 *    - Attempted path
 *    - Expected/actual flow
 *    - Helps user understand why redirected
 *
 * 5. Return Null During Redirect
 *    - Don't render children while redirecting
 *    - Prevents flash of wrong content
 *    - Cleaner UI
 *
 * EXAMPLE USAGE:
 *
 * In App.tsx - Route definitions:
 * Classic flow routes use RouteGuard with expectedFlow="classic"
 * Tech-startup flow routes use RouteGuard with expectedFlow="tech-startup"
 * Homepage displays error from guard via location.state
 *
 * See implementation in App.tsx for actual usage
 */
