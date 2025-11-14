/**
 * Policy API Client Service
 *
 * Handles all HTTP requests related to policy binding, activation, and retrieval.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface BindQuoteRequest {
  quoteNumber: string;
  paymentMethod: 'credit_card' | 'ach';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  routingNumber?: string;
  accountNumber?: string;
  accountType?: 'checking' | 'savings';
}

export interface BindQuoteResponse {
  policyId: string;
  policyNumber: string;
  status: 'BOUND';
  payment: {
    paymentId: string;
    paymentNumber: string;
    lastFourDigits: string;
    cardBrand?: string;
  };
  documents: Array<{
    document_id: string;
    document_number: string;
    document_type: string;
    document_name: string;
    storage_url: string;
  }>;
}

export interface ActivatePolicyResponse {
  policyId: string;
  status: 'IN_FORCE';
  effectiveDate: string;
  expirationDate: string;
}

export interface Policy {
  policy_identifier: string;
  policy_number: string;
  status_code: string;
  effective_date: string;
  expiration_date: string;
  quote_snapshot: any;
  premium?: {
    total: number;
    monthly: number;
  };
}

/**
 * Bind a quote to a policy with payment
 */
export async function bindQuote(data: BindQuoteRequest): Promise<BindQuoteResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/policies/bind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Activate a policy (transition from BOUND to IN_FORCE)
 */
export async function activatePolicy(policyId: string): Promise<ActivatePolicyResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/policies/${policyId}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Activation failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get policy details by policy ID
 */
export async function getPolicy(policyId: string): Promise<Policy> {
  const response = await fetch(`${API_BASE_URL}/v1/policies/${policyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch policy' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
