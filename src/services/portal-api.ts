/**
 * Portal API Client Service
 *
 * Handles all HTTP requests to portal endpoints.
 */

const API_BASE_URL = 'http://localhost:3000';

/**
 * Get dashboard data (policy, drivers, vehicles, payments, claims)
 */
export async function getDashboardData(policyNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/dashboard`);

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get policy details
 */
export async function getPolicy(policyNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/policy`);

  if (!response.ok) {
    throw new Error('Failed to fetch policy');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get billing history
 */
export async function getBillingHistory(policyNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/billing`);

  if (!response.ok) {
    throw new Error('Failed to fetch billing history');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get claims list
 */
export async function getClaims(policyNumber: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/claims`);

  if (!response.ok) {
    throw new Error('Failed to fetch claims');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get claim details
 */
export async function getClaimDetails(policyNumber: string, claimId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/claims/${claimId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch claim details');
  }

  const result = await response.json();
  return result.data;
}

/**
 * File a new claim
 */
export async function fileClaim(
  policyNumber: string,
  claimData: {
    incident_date: string;
    loss_type: string;
    description: string;
    vehicle_identifier?: string;
    driver_identifier?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claimData),
  });

  if (!response.ok) {
    throw new Error('Failed to file claim');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Upload claim document
 */
export async function uploadClaimDocument(policyNumber: string, claimId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/claims/${claimId}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Download document (mock)
 */
export async function downloadDocument(policyNumber: string, documentId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/portal/${policyNumber}/documents/${documentId}`);

  if (!response.ok) {
    throw new Error('Failed to download document');
  }

  const result = await response.json();
  return result.data;
}
