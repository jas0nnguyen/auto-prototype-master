/**
 * QuoteContext (T041-T042)
 *
 * This context provides quote data and recalculation functionality
 * to all components within the TechStartupLayout.
 *
 * WHAT IS A CONTEXT?
 * Context is React's way to share data across multiple components
 * without passing props through every level (prop drilling).
 *
 * Think of it like a water main:
 * - Without context: Pass water (data) through pipes (props) to each house
 * - With context: Central water main, each house taps into it directly
 *
 * PROVIDER PATTERN:
 * 1. Create context with createContext()
 * 2. Create provider component that holds the data
 * 3. Wrap components with provider
 * 4. Components use useContext() to access data
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuote, useRecalculateQuote } from '../../../hooks/useQuote';
import type { QuoteResponse } from '../../../services/quote-api';

/**
 * QuoteContextValue Interface
 *
 * Defines the shape of data provided by QuoteContext.
 * Components can access:
 * - quote: The current quote data (or undefined if loading/error)
 * - isLoading: Boolean indicating if quote is being fetched
 * - recalculatePremium: Function to trigger premium recalculation
 */
export interface QuoteContextValue {
  /** Current quote data */
  quote: QuoteResponse | undefined;

  /** Loading state for quote fetch */
  isLoading: boolean;

  /** Function to recalculate premium */
  recalculatePremium: () => void;
}

/**
 * QuoteContext
 *
 * Created with createContext<QuoteContextValue | null>(null)
 * - null is the default value (when no provider exists)
 * - QuoteContextValue | null means it can be either value or null
 */
const QuoteContext = createContext<QuoteContextValue | null>(null);

/**
 * QuoteProvider Props
 *
 * The provider component accepts:
 * - quoteId: UUID of the quote to fetch
 * - children: React components to wrap
 */
interface QuoteProviderProps {
  quoteId: string;
  children: ReactNode;
}

/**
 * QuoteProvider Component (T042)
 *
 * This provider component:
 * 1. Fetches quote data using useQuote hook
 * 2. Provides recalculatePremium mutation
 * 3. Wraps children in QuoteContext.Provider
 *
 * Usage:
 * ```tsx
 * <QuoteProvider quoteId="123-456-789">
 *   <VehicleInfoPage />
 * </QuoteProvider>
 * ```
 */
export const QuoteProvider: React.FC<QuoteProviderProps> = ({ quoteId, children }) => {
  /**
   * useQuote Hook
   *
   * Fetches quote data from the API.
   * Returns:
   * - data: The quote object (QuoteResponse)
   * - isLoading: Boolean for loading state
   * - error: Error object if fetch failed
   */
  const { data: quote, isLoading } = useQuote(quoteId);

  /**
   * useRecalculateQuote Hook
   *
   * Provides mutation to recalculate premium.
   * Returns:
   * - mutate: Function to trigger recalculation
   * - isLoading: Boolean for mutation state
   */
  const recalculateMutation = useRecalculateQuote();

  /**
   * recalculatePremium Function
   *
   * Wrapper function that calls the mutation with the current quoteId.
   * This is what components will call to recalculate premium.
   */
  const recalculatePremium = () => {
    recalculateMutation.mutate(quoteId);
  };

  /**
   * Context Value
   *
   * Object that will be available to all children via useQuoteContext()
   */
  const value: QuoteContextValue = {
    quote,
    isLoading,
    recalculatePremium,
  };

  /**
   * Render Provider
   *
   * QuoteContext.Provider makes the value available to all children.
   * Any component inside can call useQuoteContext() to access it.
   */
  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};

/**
 * useQuoteContext Hook
 *
 * Custom hook to access QuoteContext.
 * Throws error if used outside QuoteProvider (type safety).
 *
 * Usage in components:
 * ```tsx
 * const { quote, isLoading, recalculatePremium } = useQuoteContext();
 *
 * if (isLoading) return <Spinner />;
 * if (!quote) return <Error />;
 *
 * return (
 *   <div>
 *     <p>Premium: ${quote.total_premium}</p>
 *     <button onClick={recalculatePremium}>Recalculate</button>
 *   </div>
 * );
 * ```
 */
export const useQuoteContext = (): QuoteContextValue => {
  const context = useContext(QuoteContext);

  /**
   * Type Guard
   *
   * If context is null, it means component is not inside QuoteProvider.
   * Throw an error to alert developer (better than runtime undefined errors).
   */
  if (context === null) {
    throw new Error('useQuoteContext must be used within a QuoteProvider');
  }

  return context;
};

/**
 * ============================================================================
 * LEARNING SUMMARY: REACT CONTEXT API
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. CONTEXT
 *    - Global state for a component tree
 *    - Avoid prop drilling (passing props through many levels)
 *    - Created with createContext()
 *
 * 2. PROVIDER
 *    - Component that holds the state
 *    - Wraps children to provide access
 *    - Uses Context.Provider with value prop
 *
 * 3. CONSUMER/HOOK
 *    - useContext() hook to read context
 *    - Must be inside Provider component
 *    - Type-safe with TypeScript
 *
 * ANALOGIES:
 *
 * - Context = Wi-Fi Network
 *   - Provider = Router (broadcasts signal)
 *   - Consumer = Device (connects to network)
 *   - Value = Internet connection
 *
 * - Context = Theme Park
 *   - Provider = Park entrance (issues wristbands)
 *   - Consumer = Ride (checks wristband)
 *   - Value = Access privileges
 *
 * BEST PRACTICES:
 *
 * 1. One Context Per Domain
 *    - QuoteContext for quote data
 *    - UserContext for user data
 *    - Don't put everything in one context
 *
 * 2. Provide Type Safety
 *    - Define interface for context value
 *    - Use TypeScript generics
 *    - Throw error if used outside provider
 *
 * 3. Custom Hook Pattern
 *    - Create useQuoteContext() instead of using useContext(QuoteContext)
 *    - Encapsulates error checking
 *    - Better developer experience
 *
 * 4. Keep Context Focused
 *    - Only put related data together
 *    - Separate concerns (quote vs user vs theme)
 *    - Easier to reason about
 */
