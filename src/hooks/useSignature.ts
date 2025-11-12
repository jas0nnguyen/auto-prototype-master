/**
 * useSignature Custom Hook (T039)
 *
 * This React hook provides signature functionality to components using TanStack Query.
 * Follows the same patterns as useQuote.ts for consistency.
 *
 * WHAT THIS HOOK PROVIDES:
 * - useCreateSignature() - Mutation for creating signatures
 * - useSignature() - Query for fetching signatures by quote ID
 *
 * WHY USE TANSTACK QUERY FOR SIGNATURES?
 * - Automatic caching (signature loaded once, reused everywhere)
 * - Loading/error states (better UX)
 * - Optimistic updates (instant feedback)
 * - Background refetching (keep data fresh)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  signatureApi,
  type CreateSignatureRequest,
  type SignatureResponse,
} from '../services/signature-api';

/**
 * Query Keys
 *
 * TanStack Query uses keys to identify and cache queries.
 * Consistent naming helps with cache management.
 *
 * Key structure:
 * - ['signatures'] - All signatures (base key)
 * - ['signatures', 'quote', quoteId] - Signature for specific quote
 */
export const signatureKeys = {
  /** All signatures */
  all: ['signatures'] as const,

  /** Signature by quote ID */
  byQuoteId: (quoteId: string) => ['signatures', 'quote', quoteId] as const,
};

/**
 * useSignature Hook - Fetch signature by quote ID
 *
 * Usage:
 * ```typescript
 * const { data: signature, isLoading, error } = useSignature(quoteId);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (!signature) return <NoSignature />;
 *
 * return <img src={signature.signature_image_data} alt="Signature" />;
 * ```
 *
 * @param quoteId - Quote identifier (UUID)
 * @param options - TanStack Query options
 * @returns Query result with signature data, loading state, error state
 */
export function useSignature(
  quoteId: string | null | undefined,
  options?: Partial<UseQueryOptions<SignatureResponse, Error>>
) {
  /**
   * useQuery Hook
   *
   * Automatically fetches signature when component mounts.
   * Caches result for reuse across components.
   * Refetches in background when data becomes stale.
   */
  return useQuery<SignatureResponse, Error>({
    /**
     * Query key - unique identifier for this query
     * If quoteId changes, creates a new query
     */
    queryKey: quoteId ? signatureKeys.byQuoteId(quoteId) : ['signatures', 'none'],

    /**
     * Query function - fetches the data
     * Called when query needs to fetch/refetch
     */
    queryFn: () => {
      if (!quoteId) {
        return Promise.reject(new Error('No quote ID provided'));
      }
      return signatureApi.getSignatureByQuoteId(quoteId);
    },

    /**
     * Options
     */
    // Only run query if quoteId exists
    enabled: !!quoteId && (options?.enabled !== false),

    // Cache the data for 10 minutes (signatures don't change often)
    staleTime: 10 * 60 * 1000,

    // Keep unused data in cache for 15 minutes
    gcTime: 15 * 60 * 1000,

    // Don't refetch on window focus (signature won't change)
    refetchOnWindowFocus: false,

    // Retry once on failure (signature might not exist yet)
    retry: 1,

    // Allow overriding options
    ...options,
  });
}

/**
 * useCreateSignature Hook - Create a new signature
 *
 * useMutation is for operations that modify data (POST, PUT, DELETE).
 *
 * Usage:
 * ```typescript
 * const createSignature = useCreateSignature();
 *
 * const handleSaveSignature = async (signatureData: string) => {
 *   try {
 *     const signature = await createSignature.mutateAsync({
 *       quote_id: quoteId,
 *       party_id: partyId,
 *       signature_image_data: signatureData,
 *       signature_format: 'PNG',
 *     });
 *     console.log('Signature saved:', signature.signature_id);
 *     navigate('/next-page');
 *   } catch (error) {
 *     console.error('Failed to save signature:', error);
 *     showError('Please try again');
 *   }
 * };
 *
 * return (
 *   <button
 *     onClick={handleSaveSignature}
 *     disabled={createSignature.isPending}
 *   >
 *     {createSignature.isPending ? 'Saving...' : 'Accept Signature'}
 *   </button>
 * );
 * ```
 *
 * @returns Mutation result with mutate/mutateAsync functions
 */
export function useCreateSignature() {
  /**
   * useQueryClient gives us access to the query cache
   * We'll use it to update cached data after creating a signature
   */
  const queryClient = useQueryClient();

  /**
   * useMutation Hook
   *
   * Handles the POST request to create a signature.
   * Provides loading/error states and callbacks.
   */
  return useMutation<
    SignatureResponse,        // Return type (what mutation returns)
    Error,                     // Error type
    CreateSignatureRequest     // Variables type (what you pass to mutate())
  >({
    /**
     * Mutation function
     *
     * Receives the data passed to mutate() or mutateAsync()
     */
    mutationFn: (data: CreateSignatureRequest) => signatureApi.createSignature(data),

    /**
     * onSuccess callback
     *
     * Called when mutation succeeds.
     * Perfect place to:
     * - Add new signature to cache
     * - Invalidate related queries
     * - Show success message
     * - Navigate to next page
     */
    onSuccess: (newSignature: SignatureResponse) => {
      /**
       * Add signature to cache immediately
       *
       * This makes the signature available without fetching.
       * Any component using useSignature(quoteId) will get this data instantly.
       */
      queryClient.setQueryData(
        signatureKeys.byQuoteId(newSignature.quote_id),
        newSignature
      );

      /**
       * Invalidate the 'all signatures' query
       *
       * If we had a list of signatures, this would refresh it.
       * Not strictly necessary here but good practice.
       */
      queryClient.invalidateQueries({ queryKey: signatureKeys.all });

      console.log('[useCreateSignature] Signature created successfully:', newSignature.signature_id);
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
      console.error('[useCreateSignature] Error creating signature:', error);
      // Could show a toast notification here
      // Could track error in analytics
    },
  });
}

/**
 * ============================================================================
 * LEARNING SUMMARY: TANSTACK QUERY HOOKS FOR SIGNATURES
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. QUERY KEYS FOR SIGNATURES
 *    - Base key: ['signatures']
 *    - By quote: ['signatures', 'quote', quoteId]
 *    - Hierarchical structure for cache management
 *
 * 2. USEQUERY FOR FETCHING
 *    - Fetches signature by quote ID
 *    - Caches result for reuse
 *    - Only enabled when quoteId provided
 *    - Retries once (signature might not exist yet)
 *
 * 3. USEMUTATION FOR CREATING
 *    - POSTs signature to backend
 *    - Updates cache on success
 *    - Provides loading/error states
 *    - Returns promise for async/await
 *
 * 4. CACHE MANAGEMENT
 *    - setQueryData - Add to cache immediately
 *    - invalidateQueries - Mark queries as stale
 *    - Ensures consistent data across components
 *
 * 5. ERROR HANDLING
 *    - Try/catch in components
 *    - onError callback in hook
 *    - User-friendly error messages
 *
 * ANALOGIES:
 *
 * - useSignature = Photo Album
 *   - Request photo (query)
 *   - Album finds it (cache hit)
 *   - Or orders print (fetch)
 *   - Keeps photo for later (cache)
 *
 * - useCreateSignature = Photo Studio
 *   - Take photo (draw signature)
 *   - Develop photo (POST to API)
 *   - Add to album (update cache)
 *   - Give you copy (return result)
 *
 * - Query Keys = File Cabinet Labels
 *   - ['signatures'] = Signatures drawer
 *   - ['signatures', 'quote', 'Q123'] = Quote Q123's folder
 *   - Easy to find and update
 *
 * BEST PRACTICES:
 *
 * 1. Centralize Query Keys
 *    - Define in signatureKeys object
 *    - All hooks use same keys
 *    - Consistent cache management
 *
 * 2. Update Cache Immediately
 *    - Use setQueryData after creation
 *    - No need to refetch
 *    - Instant UI updates
 *
 * 3. Handle Loading States
 *    - Show spinner while creating
 *    - Disable buttons during mutation
 *    - Better UX
 *
 * 4. Validate Before Sending
 *    - Check signature not empty
 *    - Validate image size
 *    - Better error messages
 *
 * 5. Use TypeScript Types
 *    - Generic types in hooks
 *    - Type-safe mutations
 *    - Catch errors at compile time
 *
 * EXAMPLE USAGE IN COMPONENT:
 *
 * ```typescript
 * function SignaturePage() {
 *   const { quoteId, partyId } = useParams();
 *   const createSignature = useCreateSignature();
 *   const sigPadRef = useRef<SignatureCanvas>(null);
 *
 *   const handleAccept = async () => {
 *     if (sigPadRef.current?.isEmpty()) {
 *       alert('Please provide a signature');
 *       return;
 *     }
 *
 *     const dataURL = sigPadRef.current?.toDataURL('image/png');
 *
 *     try {
 *       await createSignature.mutateAsync({
 *         quote_id: quoteId!,
 *         party_id: partyId!,
 *         signature_image_data: dataURL!,
 *         signature_format: 'PNG',
 *       });
 *       navigate('/confirmation');
 *     } catch (error) {
 *       alert('Failed to save signature. Please try again.');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <SignatureCanvas ref={sigPadRef} />
 *       <button
 *         onClick={handleAccept}
 *         disabled={createSignature.isPending}
 *       >
 *         {createSignature.isPending ? 'Saving...' : 'Accept'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
