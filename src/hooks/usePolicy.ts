/**
 * usePolicy Hook - TanStack Query Integration
 *
 * Custom React hooks for policy binding, activation, and retrieval.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bindQuote,
  activatePolicy,
  getPolicy,
  type BindQuoteRequest,
  type BindQuoteResponse,
  type ActivatePolicyResponse,
  type Policy,
} from '../services/policy-api';

/**
 * Query key factory for policies
 */
export const policyKeys = {
  all: ['policies'] as const,
  detail: (id: string) => ['policies', id] as const,
};

/**
 * Hook: Fetch policy by ID
 */
export function usePolicy(policyId: string | undefined) {
  return useQuery({
    queryKey: policyKeys.detail(policyId || ''),
    queryFn: () => getPolicy(policyId!),
    enabled: !!policyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook: Bind quote to policy with payment
 */
export function useBindQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BindQuoteRequest) => bindQuote(data),
    onSuccess: (data: BindQuoteResponse) => {
      // Invalidate and refetch quote queries
      queryClient.invalidateQueries({ queryKey: ['quotes'] });

      // Pre-populate policy cache
      queryClient.setQueryData(policyKeys.detail(data.policyId), {
        policy_identifier: data.policyId,
        policy_number: data.policyNumber,
        status_code: data.status,
      });
    },
  });
}

/**
 * Hook: Activate policy (BOUND → IN_FORCE)
 */
export function useActivatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => activatePolicy(policyId),
    onSuccess: (data: ActivatePolicyResponse, policyId: string) => {
      // Invalidate policy query to refetch updated status
      queryClient.invalidateQueries({ queryKey: policyKeys.detail(policyId) });

      // Optimistically update cache
      queryClient.setQueryData(policyKeys.detail(policyId), (old: Policy | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status_code: data.status,
        };
      });
    },
  });
}
