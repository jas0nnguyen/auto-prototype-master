/**
 * Document Type Definitions
 *
 * TypeScript types for document generation, storage, and metadata.
 * Used for declarations, policy documents, ID cards, and claim attachments.
 *
 * Feature: 003-document-rendering-download
 */

/**
 * Types of documents that can be generated in the system
 */
export enum DocumentType {
  DECLARATIONS = 'DECLARATIONS',
  POLICY_DOCUMENT = 'POLICY_DOCUMENT',
  ID_CARD = 'ID_CARD',
  CLAIM_ATTACHMENT = 'CLAIM_ATTACHMENT',
  PROOF_OF_INSURANCE = 'PROOF_OF_INSURANCE',
}

/**
 * Document generation and availability status
 */
export enum DocumentStatus {
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED',
  SUPERSEDED = 'SUPERSEDED',
}

/**
 * Document metadata returned by API
 *
 * Represents a stored document with tracking information
 */
export interface DocumentMetadata {
  /** Unique document identifier (UUID) */
  document_id: string;

  /** Human-readable document reference number */
  document_number: string;

  /** Type of document */
  document_type: DocumentType;

  /** Display name of the document */
  document_name: string;

  /** Version number (increments when superseded) */
  version: number;

  /** Whether this is the current active version */
  is_current: boolean;

  /** Current status of the document */
  document_status: DocumentStatus;

  /** Storage location URL (null if not yet generated) */
  storage_url: string | null;

  /** File size in bytes (null if not yet generated) */
  file_size_bytes: number | null;

  /** MIME type (e.g., 'application/pdf') */
  mime_type: string;

  /** Timestamp when document was created */
  created_at: Date;

  /** Timestamp of last access (null if never accessed) */
  accessed_at: Date | null;

  /** Number of times document has been accessed */
  accessed_count: number;
}

/**
 * Request payload for generating a new document
 */
export interface DocumentGenerationRequest {
  /** Policy ID to generate document for */
  policy_id: string;

  /** Type of document to generate */
  document_type: DocumentType;

  /** Vehicle ID (required for ID_CARD type) */
  vehicle_id?: string;

  /** If true, supersede existing document and create new version */
  force_regenerate?: boolean;
}

/**
 * Result of document generation operation
 */
export interface DocumentGenerationResult {
  /** Generated document ID */
  document_id: string;

  /** Generated document reference number */
  document_number: string;

  /** Status of the document generation */
  document_status: DocumentStatus;

  /** Storage URL (if generation succeeded) */
  storage_url?: string;

  /** Error message (if generation failed) */
  error_message?: string;
}
