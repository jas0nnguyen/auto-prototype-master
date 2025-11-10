/**
 * Signature API Client Service (T038)
 *
 * This service handles all HTTP communication with the backend signature API.
 * Manages digital signature creation and retrieval for quote signing ceremonies.
 *
 * WHAT IS A DIGITAL SIGNATURE?
 * A digital signature in this context is a base64-encoded image (PNG or JPEG)
 * captured from a canvas element where the user drew their signature.
 *
 * Think of it like:
 * - User draws on tablet (canvas)
 * - Canvas converts drawing to image
 * - Image converted to text (base64)
 * - Text sent to server (API)
 * - Server stores text in database
 * - Later: text converted back to image (display)
 */

/**
 * Signature request/response types (matching backend API contract)
 */
export interface CreateSignatureRequest {
  /** UUID of the quote being signed */
  quote_id: string;
  /** UUID of the party (signer) */
  party_id: string;
  /** Base64-encoded signature image data (includes data URI prefix) */
  signature_image_data: string;
  /** Image format (PNG or JPEG) */
  signature_format: 'PNG' | 'JPEG';
}

export interface SignatureResponse {
  /** UUID of the created/retrieved signature */
  signature_id: string;
  /** UUID of the associated quote */
  quote_id: string;
  /** UUID of the signer */
  party_id: string;
  /** Base64-encoded signature image data */
  signature_image_data?: string;
  /** Image format */
  signature_format: 'PNG' | 'JPEG';
  /** Timestamp when signature was created */
  signature_date: string;
  /** Database created_at timestamp */
  created_at: string;
}

/**
 * API Error Response
 */
export interface SignatureApiError {
  status: 'error';
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE' | 'INTERNAL_ERROR';
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Signature API Service Class
 *
 * Provides methods for signature-related API operations.
 * Follows the same pattern as QuoteApiService for consistency.
 */
class SignatureApiService {
  /**
   * Base API URL
   *
   * Uses '/api/v1' which Vite proxy forwards to localhost:3000 in development.
   * In production (Vercel), both frontend and backend are on same domain.
   */
  private baseUrl = '/api/v1';

  /**
   * Create a new signature
   *
   * POST /api/v1/signatures
   *
   * Stores a digital signature captured during the signing ceremony.
   *
   * @param data - Signature creation data
   * @returns Promise resolving to created signature
   *
   * WHAT HAPPENS BEHIND THE SCENES:
   * 1. User draws signature on canvas
   * 2. Canvas.toDataURL() converts to base64 string
   * 3. This method sends string to backend
   * 4. Backend validates and stores in database
   * 5. Backend returns signature record with ID
   *
   * ERROR CASES:
   * - 400: Empty signature, invalid format, file too large (>1MB)
   * - 404: Quote or Party not found
   * - 409: Signature already exists for this quote
   */
  async createSignature(data: CreateSignatureRequest): Promise<SignatureResponse> {
    try {
      /**
       * Make POST request to create signature
       */
      const response = await fetch(`${this.baseUrl}/signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      /**
       * Handle error responses
       */
      if (!response.ok) {
        const error: SignatureApiError = await response.json();
        throw new Error(error.error.message || 'Failed to create signature');
      }

      /**
       * Parse and return successful response
       *
       * Backend returns:
       * {
       *   status: "success",
       *   data: { signature_id, quote_id, party_id, ... }
       * }
       */
      const result = await response.json();
      return result.data || result;

    } catch (error) {
      /**
       * Log and re-throw error
       *
       * The calling component will handle displaying the error to the user
       */
      console.error('[SignatureAPI] Error creating signature:', error);
      throw error;
    }
  }

  /**
   * Get signature by quote ID
   *
   * GET /api/v1/signatures/:quoteId
   *
   * Retrieves the signature associated with a specific quote.
   * Used to display signature on confirmation screens or policy documents.
   *
   * @param quoteId - UUID of the quote
   * @returns Promise resolving to signature data
   *
   * WHEN TO USE THIS:
   * - Display signature on policy confirmation page
   * - Show signature in portal (policy details)
   * - Include signature in PDF documents
   * - Verify signature exists before binding
   *
   * ERROR CASES:
   * - 404: No signature found for this quote
   * - 400: Invalid quote ID format
   */
  async getSignatureByQuoteId(quoteId: string): Promise<SignatureResponse> {
    try {
      /**
       * Make GET request to retrieve signature
       */
      const response = await fetch(`${this.baseUrl}/signatures/${quoteId}`);

      /**
       * Handle error responses
       */
      if (!response.ok) {
        const error: SignatureApiError = await response.json();
        throw new Error(error.error.message || 'Failed to fetch signature');
      }

      /**
       * Parse and return successful response
       */
      const result = await response.json();
      return result.data || result;

    } catch (error) {
      /**
       * Log and re-throw error
       */
      console.error('[SignatureAPI] Error fetching signature:', error);
      throw error;
    }
  }
}

/**
 * Export singleton instance
 *
 * SINGLETON PATTERN (same as QuoteApiService):
 * - One instance shared across entire app
 * - Consistent configuration
 * - Easy to mock for testing
 */
export const signatureApi = new SignatureApiService();

/**
 * Also export the class for testing/mocking
 */
export default SignatureApiService;

/**
 * ============================================================================
 * LEARNING SUMMARY: DIGITAL SIGNATURES
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. BASE64 ENCODING
 *    - Binary data ’ text string
 *    - Images can be stored as text
 *    - Safe for JSON/database storage
 *    - Increases size by ~33%
 *
 * 2. DATA URI FORMAT
 *    - data:image/png;base64,iVBORw0KGgoAAAANS...
 *    - Prefix describes content type
 *    - Followed by base64-encoded data
 *    - Can be used in <img src="...">
 *
 * 3. CANVAS API
 *    - HTML canvas for drawing
 *    - toDataURL() exports as base64
 *    - Supports PNG, JPEG, WEBP
 *    - Used by signature libraries
 *
 * 4. SIGNATURE WORKFLOW
 *    - User draws ’ Canvas capture ’ Base64 encode ’ API POST
 *    - Later: API GET ’ Base64 decode ’ Display image
 *
 * 5. SIGNATURE VALIDATION
 *    - Check not empty (isEmpty())
 *    - Check file size (<1MB)
 *    - Check format (PNG/JPEG)
 *    - One signature per quote
 *
 * ANALOGIES:
 *
 * - Base64 Encoding = Gift Wrapping
 *   - Take physical item (image bytes)
 *   - Wrap in paper (convert to text)
 *   - Ship safely (store in database)
 *   - Unwrap to use (decode back to image)
 *
 * - Data URI = Package Label
 *   - Describes what's inside (image/png)
 *   - Includes contents (base64 data)
 *   - Can be used directly (in img tag)
 *
 * - Signature API = Notary Service
 *   - Witness signature (POST)
 *   - Store record (database)
 *   - Provide proof later (GET)
 *   - One signature per document
 *
 * BEST PRACTICES:
 *
 * 1. Validate Before Sending
 *    - Check canvas not empty
 *    - Check file size reasonable
 *    - Better UX (faster feedback)
 *
 * 2. Handle Errors Gracefully
 *    - Show clear error messages
 *    - Allow user to retry
 *    - Don't lose form data
 *
 * 3. Compress Images
 *    - Use JPEG for smaller size
 *    - Reduce quality if acceptable
 *    - Keep under 1MB limit
 *
 * 4. Secure Storage
 *    - Associate with quote/party
 *    - Include timestamp
 *    - Prevent tampering
 *
 * 5. Display Feedback
 *    - Show preview before submit
 *    - Confirm after save
 *    - Display on final documents
 *
 * SECURITY NOTES:
 *
 * - Digital signatures are NOT cryptographic signatures
 * - They're just images of handwritten signatures
 * - For legal/compliance, consider:
 *   - Timestamp when signed
 *   - IP address of signer
 *   - User agent info
 *   - Additional verification (SMS, email)
 * - In production, add authentication
 * - Consider e-signature regulations (ESIGN Act, eIDAS)
 */
