/**
 * Portal Custom Hooks
 *
 * TanStack Query hooks for portal data fetching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as portalApi from '../services/portal-api';

/**
 * Get dashboard data (cached)
 */
export function usePortalDashboard(policyNumber: string) {
  return useQuery({
    queryKey: ['portal', 'dashboard', policyNumber],
    queryFn: () => portalApi.getDashboardData(policyNumber),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get policy details (cached)
 */
export function usePolicy(policyNumber: string) {
  return useQuery({
    queryKey: ['portal', 'policy', policyNumber],
    queryFn: () => portalApi.getPolicy(policyNumber),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get billing history (cached)
 */
export function useBillingHistory(policyNumber: string) {
  return useQuery({
    queryKey: ['portal', 'billing', policyNumber],
    queryFn: () => portalApi.getBillingHistory(policyNumber),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get claims list (cached)
 */
export function useClaims(policyNumber: string) {
  return useQuery({
    queryKey: ['portal', 'claims', policyNumber],
    queryFn: () => portalApi.getClaims(policyNumber),
    staleTime: 1000 * 60 * 1, // 1 minute (claims update more frequently)
  });
}

/**
 * Get claim details (cached)
 */
export function useClaimDetails(policyNumber: string, claimId: string) {
  return useQuery({
    queryKey: ['portal', 'claims', policyNumber, claimId],
    queryFn: () => portalApi.getClaimDetails(policyNumber, claimId),
    enabled: !!claimId, // Only fetch if claimId is provided
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * File a new claim (mutation)
 */
export function useFileClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyNumber,
      claimData,
    }: {
      policyNumber: string;
      claimData: {
        incident_date: string;
        loss_type: string;
        description: string;
        vehicle_identifier?: string;
        driver_identifier?: string;
      };
    }) => portalApi.fileClaim(policyNumber, claimData),
    onSuccess: (_, variables) => {
      // Invalidate claims list to refetch
      queryClient.invalidateQueries({
        queryKey: ['portal', 'claims', variables.policyNumber],
      });
    },
  });
}

/**
 * Upload claim document (mutation)
 */
export function useUploadClaimDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyNumber,
      claimId,
      file,
    }: {
      policyNumber: string;
      claimId: string;
      file: File;
    }) => portalApi.uploadClaimDocument(policyNumber, claimId, file),
    onSuccess: (_, variables) => {
      // Invalidate claim details to refetch with new document
      queryClient.invalidateQueries({
        queryKey: ['portal', 'claims', variables.policyNumber, variables.claimId],
      });
    },
  });
}
