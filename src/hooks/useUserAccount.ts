/**
 * User Account Hooks
 *
 * TanStack Query hooks for user account operations:
 * - useCheckEmail: Check if email exists
 * - useCreateAccount: Create new user account
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { checkEmail, createAccount } from '../services/user-account-api';

/**
 * Check if email exists (query)
 *
 * Usage:
 * const { data, isLoading } = useCheckEmail(email, { enabled: !!email });
 */
export function useCheckEmail(email: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['user-account', 'check-email', email],
    queryFn: () => checkEmail(email),
    enabled: options?.enabled ?? false, // Only run when explicitly enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create user account (mutation)
 *
 * Usage:
 * const createAccountMutation = useCreateAccount();
 * createAccountMutation.mutate({ email, password, first_name, last_name });
 */
export function useCreateAccount() {
  return useMutation({
    mutationFn: createAccount,
  });
}
