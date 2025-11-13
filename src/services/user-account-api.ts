/**
 * User Account API Client
 *
 * Provides functions to interact with user account endpoints:
 * - checkEmail: Check if email exists in database
 * - createAccount: Create new user account
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CheckEmailResponse {
  exists: boolean;
  user_id: string | null;
}

interface CreateAccountRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface CreateAccountResponse {
  status: string;
  data: {
    user_account_id: string;
    email: string;
  };
}

/**
 * Check if email exists in database
 */
export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/user-accounts/check-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check email');
  }

  return response.json();
}

/**
 * Create new user account
 */
export async function createAccount(data: CreateAccountRequest): Promise<CreateAccountResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/user-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create account');
  }

  return response.json();
}
