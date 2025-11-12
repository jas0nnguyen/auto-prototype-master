/**
 * useQuote Custom Hook (T078)
 *
 * This React hook provides quote functionality to components using TanStack Query.
 *
 * WHAT IS A CUSTOM HOOK?
 * A custom hook is a JavaScript function that:
 * - Starts with "use" (React convention)
 * - Can use other hooks (useState, useEffect, etc.)
 * - Encapsulates reusable logic
 * - Returns data and functions components need
 *
 * Think of hooks like power tools:
 * - useState = drill (stores state)
 * - useEffect = saw (runs side effects)
 * - useQuote = power drill combo (combines multiple tools)
 *
 * WHAT IS TANSTACK QUERY (formerly React Query)?
 * TanStack Query manages server state in React apps.
 * It handles:
 * - Fetching data from APIs
 * - Caching responses
 * - Automatic refetching
 * - Loading/error states
 * - Optimistic updates
 *
 * Without TanStack Query:
 * ```
 * const [data, setData] = useState(null);
 * const [loading, setLoading] = useState(false);
 * const [error, setError] = useState(null);
 *
 * useEffect(() => {
 *   setLoading(true);
 *   fetch('/api/data')
 *     .then(res => res.json())
 *     .then(data => setData(data))
 *     .catch(err => setError(err))
 *     .finally(() => setLoading(false));
 * }, []);
 * ```
 *
 * With TanStack Query:
 * ```
 * const { data, isLoading, error } = useQuery('data', fetchData);
 * ```
 *
 * Much simpler!
 */

import {
  useQuery,      // Hook for fetching data (GET requests)
  useMutation,   // Hook for modifying data (POST, PUT, DELETE)
  useQueryClient, // Hook to access query cache
} from '@tanstack/react-query';
import {
  quoteApi,
  CreateQuoteRequest,
  QuoteResponse,
} from '../services/quote-api';

/**
 * Query Keys
 *
 * TanStack Query uses "keys" to identify and cache queries.
 * Think of keys like labels on storage boxes:
 * - ['quotes'] = box labeled "all quotes"
 * - ['quotes', id] = box labeled "quote #123"
 *
 * Keys are used for:
 * - Caching (store results by key)
 * - Invalidation (clear cache for a key)
 * - Refetching (fetch again for a key)
 */
export const quoteKeys = {
  /** All quotes */
  all: ['quotes'] as const,

  /** Specific quote by ID */
  byId: (id: string) => ['quotes', id] as const,

  /** Specific quote by number */
  byNumber: (number: string) => ['quotes', 'number', number] as const,
};

/**
 * useQuote Hook - Fetch quote by ID
 *
 * Usage:
 * ```
 * const { data: quote, isLoading, error } = useQuote(quoteId);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <QuoteDisplay quote={quote} />;
 * ```
 *
 * @param quoteId - Quote identifier (UUID)
 * @param options - TanStack Query options
 * @returns Query result with quote data, loading state, error state
 */
export function useQuote(
  quoteId: string | null | undefined,
  options?: {
    /** Enable/disable the query (default: true) */
    enabled?: boolean;
    /** Refetch interval in milliseconds (default: no auto-refetch) */
    refetchInterval?: number;
  }
) {
  /**
   * useQuery Hook
   *
   * Signature: useQuery(queryKey, queryFn, options)
   *
   * - queryKey: Unique identifier for this query
   * - queryFn: Function that fetches the data (must return a Promise)
   * - options: Configuration (when to fetch, caching behavior, etc.)
   *
   * Returns object with:
   * - data: The fetched data (undefined until loaded)
   * - isLoading: true while fetching for the first time
   * - isFetching: true while fetching (including background refetches)
   * - error: Error object if fetch failed
   * - refetch: Function to manually refetch
   */
  return useQuery({
    /**
     * Query key
     * If quoteId changes, this creates a new query
     */
    queryKey: quoteId ? quoteKeys.byId(quoteId) : ['quotes', 'none'],

    /**
     * Query function
     * This is called when the query needs to fetch data
     */
    queryFn: () => {
      if (!quoteId) {
        return Promise.reject(new Error('No quote ID provided'));
      }
      return quoteApi.getQuoteById(quoteId);
    },

    /**
     * Options
     */
    // Only run query if quoteId exists
    enabled: !!quoteId && (options?.enabled !== false),

    // Cache the data for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Keep unused data in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,

    // Refetch on window focus (user comes back to tab)
    refetchOnWindowFocus: false,

    // Custom refetch interval (if provided)
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * useQuoteByNumber Hook - Fetch quote by quote number
 *
 * Similar to useQuote but fetches by quote number instead of ID.
 *
 * @param quoteNumber - Quote number (e.g., 'QTE-2025-123456')
 * @returns Query result
 */
export function useQuoteByNumber(quoteNumber: string | null | undefined) {
  return useQuery({
    queryKey: quoteNumber ? quoteKeys.byNumber(quoteNumber) : ['quotes', 'none'],
    queryFn: () => {
      if (!quoteNumber) {
        return Promise.reject(new Error('No quote number provided'));
      }
      return quoteApi.getQuoteByNumber(quoteNumber);
    },
    enabled: !!quoteNumber,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * useCreateQuote Hook - Create a new quote
 *
 * useMutation is for operations that modify data (POST, PUT, DELETE).
 *
 * Usage:
 * ```
 * const createQuote = useCreateQuote();
 *
 * const handleSubmit = async (formData) => {
 *   try {
 *     const quote = await createQuote.mutateAsync(formData);
 *     navigate(`/quote/${quote.quote_id}`);
 *   } catch (error) {
 *     showError(error.message);
 *   }
 * };
 *
 * return (
 *   <button
 *     onClick={handleSubmit}
 *     disabled={createQuote.isLoading}
 *   >
 *     {createQuote.isLoading ? 'Creating...' : 'Create Quote'}
 *   </button>
 * );
 * ```
 *
 * @returns Mutation result with mutate/mutateAsync functions
 */
export function useCreateQuote() {
  /**
   * useQueryClient gives us access to the query cache
   * We'll use it to invalidate cached data after creating a quote
   */
  const queryClient = useQueryClient();

  /**
   * useMutation Hook
   *
   * Signature: useMutation(mutationFn, options)
   *
   * - mutationFn: Function that performs the mutation
   * - options: Callbacks and configuration
   *
   * Returns object with:
   * - mutate: Fire-and-forget function (doesn't return promise)
   * - mutateAsync: Returns promise (for async/await)
   * - isLoading: true while mutation is running
   * - error: Error if mutation failed
   * - data: Result of successful mutation
   * - reset: Clear mutation state
   */
  return useMutation({
    /**
     * Mutation function
     *
     * This receives the data passed to mutate/mutateAsync
     */
    mutationFn: (data: CreateQuoteRequest) => quoteApi.createQuote(data),

    /**
     * onSuccess callback
     *
     * Called when mutation succeeds.
     * Good place to:
     * - Invalidate related queries (refresh data)
     * - Add new data to cache
     * - Show success message
     * - Navigate to new page
     */
    onSuccess: (newQuote: QuoteResponse) => {
      /**
       * Invalidate the 'all quotes' query
       *
       * This tells TanStack Query "the quotes list is stale, refetch it"
       * Next time a component uses useQuery with quoteKeys.all,
       * it will fetch fresh data.
       */
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });

      /**
       * Optionally, add the new quote to the cache
       *
       * This makes the quote immediately available without fetching.
       * Like pre-loading data into the cache.
       */
      queryClient.setQueryData(
        quoteKeys.byId(newQuote.quoteId),
        newQuote
      );
    },

    /**
     * onError callback
     *
     * Called when mutation fails.
     * Good place to:
     * - Log the error
     * - Show error toast
     * - Track in analytics
     */
    onError: (error: Error) => {
      console.error('[useCreateQuote] Error creating quote:', error);
      // Could show a toast notification here
    },
  });
}

/**
 * useUpdatePrimaryDriver Hook - Update primary driver information
 *
 * @returns Mutation result
 */
export function useUpdatePrimaryDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteNumber,
      driverData,
    }: {
      quoteNumber: string;
      driverData: {
        driver_first_name: string;
        driver_last_name: string;
        driver_birth_date: string;
        driver_email: string;
        driver_phone: string;
        driver_gender?: string;
        driver_marital_status?: string;
        address_line_1: string;
        address_line_2?: string;
        address_city: string;
        address_state: string;
        address_zip: string;
      };
    }) => quoteApi.updatePrimaryDriver(quoteNumber, driverData),

    onSuccess: (updatedQuote: QuoteResponse, variables) => {
      // Invalidate both byId and byNumber queries
      if (updatedQuote.quoteId) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byId(updatedQuote.quoteId),
        });
      }
      if (variables.quoteNumber) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byNumber(variables.quoteNumber),
        });
      }
    },

    onError: (error: Error) => {
      console.error('[useUpdatePrimaryDriver] Error updating primary driver:', error);
    },
  });
}

/**
 * useUpdateQuoteDrivers Hook - Update additional drivers
 *
 * @returns Mutation result
 */
export function useUpdateQuoteDrivers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteNumber,
      additionalDrivers,
    }: {
      quoteNumber: string;
      additionalDrivers: Array<{
        first_name: string;
        last_name: string;
        birth_date: string;
        email: string;
        phone: string;
        gender?: string;
        marital_status?: string;
        years_licensed?: number;
        relationship?: string;
      }>;
    }) => quoteApi.updateQuoteDrivers(quoteNumber, additionalDrivers),

    onSuccess: (updatedQuote: QuoteResponse, variables) => {
      // Invalidate both byId and byNumber queries
      if (updatedQuote.quoteId) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byId(updatedQuote.quoteId),
        });
      }
      if (variables.quoteNumber) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byNumber(variables.quoteNumber),
        });
      }
    },

    onError: (error: Error) => {
      console.error('[useUpdateQuoteDrivers] Error updating drivers:', error);
    },
  });
}

/**
 * useUpdateQuoteVehicles Hook - Update vehicles
 *
 * @returns Mutation result
 */
export function useUpdateQuoteVehicles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteNumber,
      vehicles,
    }: {
      quoteNumber: string;
      vehicles: Array<{
        year: number;
        make: string;
        model: string;
        vin?: string;
        body_type?: string;
        annual_mileage?: number;
        primary_driver_id?: string;
      }>;
    }) => quoteApi.updateQuoteVehicles(quoteNumber, vehicles),

    onSuccess: (updatedQuote: QuoteResponse, variables) => {
      // Invalidate both byId and byNumber queries
      if (updatedQuote.quoteId) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byId(updatedQuote.quoteId),
        });
      }
      if (variables.quoteNumber) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byNumber(variables.quoteNumber),
        });
      }
    },

    onError: (error: Error) => {
      console.error('[useUpdateQuoteVehicles] Error updating vehicles:', error);
    },
  });
}

/**
 * useUpdateQuoteCoverage Hook - Update coverage selections and finalize quote
 *
 * @returns Mutation result
 */
export function useUpdateQuoteCoverage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteNumber,
      coverageData,
    }: {
      quoteNumber: string;
      coverageData: {
        coverage_start_date?: string;
        coverage_bodily_injury_limit?: string;
        coverage_property_damage_limit?: string;
        coverage_medical_payments_limit?: number;
        coverage_collision?: boolean;
        coverage_collision_deductible?: number;
        coverage_comprehensive?: boolean;
        coverage_comprehensive_deductible?: number;
        coverage_uninsured_motorist?: boolean;
        coverage_roadside_assistance?: boolean;
        coverage_rental_reimbursement?: boolean;
        coverage_rental_limit?: number;
        vehicle_coverages?: Array<{
          vehicle_index: number;
          collision_deductible: number;
          comprehensive_deductible: number;
        }>;
      };
    }) => quoteApi.updateQuoteCoverage(quoteNumber, coverageData),

    onSuccess: (updatedQuote: QuoteResponse, variables) => {
      // Invalidate both byId and byNumber queries
      if (updatedQuote.quoteId) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byId(updatedQuote.quoteId),
        });
      }
      if (variables.quoteNumber) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byNumber(variables.quoteNumber),
        });
      }
    },

    onError: (error: Error) => {
      console.error('[useUpdateQuoteCoverage] Error updating coverage:', error);
    },
  });
}

/**
 * useRecalculateQuote Hook - Recalculate premium
 *
 * @returns Mutation result
 */
export function useRecalculateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quoteApi.recalculateQuote(quoteId),

    onSuccess: (updatedQuote: QuoteResponse) => {
      // Update cache with new premium
      queryClient.setQueryData(
        quoteKeys.byId(updatedQuote.quote_id),
        updatedQuote
      );
    },
  });
}

/**
 * ============================================================================
 * LEARNING SUMMARY: TANSTACK QUERY HOOKS
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. CUSTOM HOOKS
 *    - Reusable functions that use React hooks
 *    - Start with "use" prefix
 *    - Encapsulate complex logic
 *    - Return data/functions components need
 *
 * 2. USEQUERY (Reading Data)
 *    - For fetching data (GET requests)
 *    - Automatic caching
 *    - Background refetching
 *    - Loading/error states built-in
 *
 * 3. USEMUTATION (Writing Data)
 *    - For creating/updating data (POST, PUT, DELETE)
 *    - Callbacks for success/error
 *    - Can invalidate/update cache
 *    - Optimistic updates
 *
 * 4. QUERY KEYS
 *    - Unique identifiers for queries
 *    - Used for caching and invalidation
 *    - Hierarchical (can invalidate groups)
 *
 * 5. QUERY CLIENT
 *    - Central cache manager
 *    - Methods: setQueryData, invalidateQueries, refetchQueries
 *    - Shared across entire app
 *
 * ANALOGIES:
 *
 * - Custom Hook = Swiss Army Knife
 *   - Multiple tools in one package
 *   - Reusable across situations
 *   - Specialized for common tasks
 *
 * - useQuery = Automatic Vending Machine
 *   - Insert key (query key)
 *   - Get product (data)
 *   - Machine remembers inventory (cache)
 *   - Restocks automatically (refetch)
 *
 * - useMutation = Order Form
 *   - Fill out form (mutation data)
 *   - Submit order (mutate)
 *   - Get confirmation (onSuccess)
 *   - Update inventory (invalidate queries)
 *
 * - Query Keys = File Cabinet Labels
 *   - Organize data by category
 *   - Find specific files quickly
 *   - Update/remove entire sections
 *
 * - Query Client = Librarian
 *   - Manages all books (queries)
 *   - Knows what's checked out (cache)
 *   - Can refresh shelves (invalidate)
 *   - Tracks everything (query state)
 *
 * BEST PRACTICES:
 *
 * 1. Define Query Keys Centrally
 *    - Create quoteKeys object
 *    - All hooks use same keys
 *    - Consistent cache management
 *
 * 2. Handle Loading/Error States
 *    - Show spinners while loading
 *    - Display error messages
 *    - Provide retry options
 *
 * 3. Invalidate Related Data
 *    - After create: invalidate list
 *    - After update: invalidate item + list
 *    - After delete: remove from cache
 *
 * 4. Use Optimistic Updates
 *    - Update UI immediately
 *    - Revert if mutation fails
 *    - Better user experience
 *
 * 5. Configure Stale Times
 *    - How long data is "fresh"
 *    - Balance performance vs freshness
 *    - Different times for different data
 */
