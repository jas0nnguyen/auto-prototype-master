/**
 * Shared Validation Utilities
 *
 * Common validation functions for OMG entities and business rules.
 * These validators are used across services, controllers, and DTOs.
 */

import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { ValidationResult } from '../entities/base';

/**
 * Validate UUID format (v4)
 *
 * @param value - String to validate as UUID
 * @returns true if valid UUID v4, false otherwise
 */
export function isValidUUID(value: string): boolean {
  return uuidValidate(value) && uuidVersion(value) === 4;
}

/**
 * Validate email format
 *
 * Uses standard RFC 5322 email regex pattern.
 *
 * @param email - Email address to validate
 * @returns true if valid email format, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Validate US phone number format
 *
 * Accepts formats: (555) 123-4567, 555-123-4567, 5551234567, etc.
 *
 * @param phone - Phone number to validate
 * @returns true if valid US phone number, false otherwise
 */
export function isValidUSPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // US phone numbers should be exactly 10 digits (or 11 with country code)
  return digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'));
}

/**
 * Format Date to YYYY-MM-DD without timezone conversion
 *
 * IMPORTANT: This function avoids timezone issues by working with the Date object's
 * local date components rather than converting to ISO/UTC.
 *
 * Problem: When you use `new Date("01/01/1990").toISOString().split('T')[0]`,
 * JavaScript interprets "01/01/1990" as midnight local time, then toISOString()
 * converts to UTC. If you're in PST (UTC-8), midnight Jan 1 becomes 8am Dec 31 UTC.
 *
 * Solution: Use the Date object's getFullYear(), getMonth(), getDate() methods
 * which return local time components without timezone conversion.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format (local timezone, no conversion)
 *
 * @example
 * const date = new Date("01/01/1990"); // Midnight local time Jan 1, 1990
 * formatDateToYYYYMMDD(date); // "1990-01-01" (correct!)
 * date.toISOString().split('T')[0]; // "1989-12-31" (wrong if in PST!)
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Validate US ZIP code format
 *
 * Accepts 5-digit (12345) or 9-digit (12345-6789) formats.
 *
 * @param zipCode - ZIP code to validate
 * @returns true if valid ZIP code format, false otherwise
 */
export function isValidZIPCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

/**
 * Validate US state code (two-letter abbreviation)
 *
 * @param stateCode - State code to validate
 * @returns true if valid state code, false otherwise
 */
export function isValidStateCode(stateCode: string): boolean {
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', // District of Columbia
  ];

  return validStates.includes(stateCode.toUpperCase());
}

/**
 * Validate VIN (Vehicle Identification Number)
 *
 * VIN must be exactly 17 characters and exclude I, O, Q to avoid confusion.
 * Performs checksum validation using VIN check digit algorithm.
 *
 * @param vin - VIN to validate
 * @returns true if valid VIN, false otherwise
 */
export function isValidVIN(vin: string): boolean {
  // VIN must be exactly 17 characters
  if (vin.length !== 17) {
    return false;
  }

  // VIN cannot contain I, O, or Q
  if (/[IOQ]/i.test(vin)) {
    return false;
  }

  // VIN check digit validation (9th character)
  return validateVINChecksum(vin);
}

/**
 * Validate VIN checksum using the standard algorithm
 *
 * @param vin - VIN to validate
 * @returns true if checksum is valid, false otherwise
 */
function validateVINChecksum(vin: string): boolean {
  const vinUpper = vin.toUpperCase();

  // Transliteration values for letters
  const transliteration: Record<string, number> = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
  };

  // Weight factors for each position
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;

  for (let i = 0; i < 17; i++) {
    const char = vinUpper[i];
    let value: number;

    if (/\d/.test(char)) {
      value = parseInt(char, 10);
    } else if (transliteration[char]) {
      value = transliteration[char];
    } else {
      return false; // Invalid character
    }

    sum += value * weights[i];
  }

  const checkDigit = sum % 11;
  const expectedCheckDigit = vinUpper[8];

  if (checkDigit === 10) {
    return expectedCheckDigit === 'X';
  } else {
    return expectedCheckDigit === checkDigit.toString();
  }
}

/**
 * Validate date is in the past
 *
 * @param date - Date to validate
 * @returns true if date is in the past, false otherwise
 */
export function isDateInPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Validate date is not in the future
 *
 * @param date - Date to validate
 * @returns true if date is today or in the past, false otherwise
 */
export function isDateNotInFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

/**
 * Validate date range (begin_date must be before end_date)
 *
 * @param beginDate - Start date
 * @param endDate - End date (can be null for ongoing validity)
 * @returns true if valid range, false otherwise
 */
export function isValidDateRange(beginDate: Date, endDate: Date | null): boolean {
  if (!endDate) {
    return true; // Null end_date is valid (ongoing)
  }
  return beginDate < endDate;
}

/**
 * Validate driver age (must be at least 16 years old)
 *
 * @param birthDate - Driver's birth date
 * @returns true if driver is at least 16 years old, false otherwise
 */
export function isValidDriverAge(birthDate: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  return actualAge >= 16;
}

/**
 * Validate credit card number using Luhn algorithm
 *
 * @param cardNumber - Credit card number (digits only)
 * @returns true if valid card number, false otherwise
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Must be digits only and 13-19 characters
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  return validateLuhnChecksum(cleaned);
}

/**
 * Luhn algorithm for credit card validation
 *
 * @param cardNumber - Card number to validate
 * @returns true if checksum is valid, false otherwise
 */
function validateLuhnChecksum(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  // Process digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate amount is positive
 *
 * @param amount - Amount to validate
 * @returns true if amount is positive, false otherwise
 */
export function isPositiveAmount(amount: number): boolean {
  return amount > 0;
}

/**
 * Validate amount is within range
 *
 * @param amount - Amount to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if amount is within range, false otherwise
 */
export function isAmountInRange(amount: number, min: number, max: number): boolean {
  return amount >= min && amount <= max;
}

/**
 * Validate policy number format
 *
 * Policy numbers follow pattern: POL-YYYY-NNNNNN
 * Example: POL-2025-123456
 *
 * @param policyNumber - Policy number to validate
 * @returns true if valid format, false otherwise
 */
export function isValidPolicyNumber(policyNumber: string): boolean {
  const policyRegex = /^POL-\d{4}-\d{6}$/;
  return policyRegex.test(policyNumber);
}

/**
 * Validate quote number format
 *
 * Quote numbers follow pattern: QTE-YYYY-NNNNNN
 * Example: QTE-2025-123456
 *
 * @param quoteNumber - Quote number to validate
 * @returns true if valid format, false otherwise
 */
export function isValidQuoteNumber(quoteNumber: string): boolean {
  const quoteRegex = /^QTE-\d{4}-\d{6}$/;
  return quoteRegex.test(quoteNumber);
}

/**
 * Validate claim number format
 *
 * Claim numbers follow pattern: CLM-YYYY-NNNNNN
 * Example: CLM-2025-123456
 *
 * @param claimNumber - Claim number to validate
 * @returns true if valid format, false otherwise
 */
export function isValidClaimNumber(claimNumber: string): boolean {
  const claimRegex = /^CLM-\d{4}-\d{6}$/;
  return claimRegex.test(claimNumber);
}

/**
 * Comprehensive validation helper
 *
 * @param value - Value to validate
 * @param validations - Array of validation functions
 * @returns ValidationResult with isValid and errors array
 */
export function validateValue(
  value: unknown,
  validations: Array<{ test: (val: unknown) => boolean; message: string }>
): ValidationResult {
  const errors: string[] = [];

  for (const validation of validations) {
    if (!validation.test(value)) {
      errors.push(validation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 *
 * @param value - Value to check
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult
 */
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  const isValid = value !== null && value !== undefined && value !== '';

  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} is required`],
  };
}
