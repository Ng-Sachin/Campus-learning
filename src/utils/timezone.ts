/**
 * Timezone Configuration
 * Centralized timezone management for the application
 */

// Primary timezone for all campuses (India Standard Time)
export const CAMPUS_TIMEZONE = 'Asia/Kolkata';
export const TIMEZONE_OFFSET_IST = '+05:30';

/**
 * Get current date/time in IST (India Standard Time)
 */
export function getISTDate(date?: Date): Date {
  const targetDate = date || new Date();
  return new Date(targetDate.toLocaleString('en-US', { timeZone: CAMPUS_TIMEZONE }));
}

/**
 * Get start of day in IST (00:00:00.000)
 */
export function getISTStartOfDay(date?: Date): Date {
  const istDate = getISTDate(date);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
}

/**
 * Get end of day in IST (23:59:59.999)
 */
export function getISTEndOfDay(date?: Date): Date {
  const istDate = getISTDate(date);
  istDate.setHours(23, 59, 59, 999);
  return istDate;
}

/**
 * Format date in IST timezone
 */
export function formatISTDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: CAMPUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };
  
  return date.toLocaleString('en-IN', defaultOptions);
}

/**
 * Format date-time in IST timezone
 */
export function formatISTDateTime(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: CAMPUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Check if a date is today in IST timezone
 */
export function isTodayIST(date: Date): boolean {
  const today = getISTDate();
  const targetDate = getISTDate(date);
  
  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  );
}

/**
 * Get the current hour in IST (0-23)
 */
export function getISTHour(): number {
  return getISTDate().getHours();
}

/**
 * Get the current minute in IST (0-59)
 */
export function getISTMinute(): number {
  return getISTDate().getMinutes();
}

/**
 * Convert date to IST date string (YYYY-MM-DD)
 */
export function toISTDateString(date: Date): string {
  const istDate = getISTDate(date);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
