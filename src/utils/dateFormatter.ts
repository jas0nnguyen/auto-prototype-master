/**
 * Date formatting utilities
 *
 * IMPORTANT: These functions avoid timezone conversion issues by parsing
 * date strings directly instead of using Date constructors.
 */

/**
 * Format YYYY-MM-DD to MM/DD/YYYY without timezone conversion
 *
 * Using new Date('2024-01-15') interprets the string as midnight UTC,
 * which then gets shifted by the browser's timezone offset when displayed.
 * In PST (UTC-8), midnight Jan 15 UTC becomes 4pm Jan 14 PST.
 *
 * This function parses the string components directly to avoid that issue.
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Formatted date string in MM/DD/YYYY format
 */
export function formatDateDisplay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
}

/**
 * Format YYYY-MM-DD to a localized date string without timezone conversion
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateLocalized(
  date: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
): string {
  const [year, month, day] = date.split('-').map(Number);
  // Create date in local timezone, not UTC
  const localDate = new Date(year, month - 1, day); // month is 0-indexed
  return localDate.toLocaleDateString(locale, options);
}

/**
 * Format YYYY-MM-DD to a long format like "January 15, 2024"
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Formatted date string in long format
 */
export function formatDateLong(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
