import dayjs, { type Dayjs } from "dayjs";

/**
 * Normalize a date string or Dayjs object to "YYYY-MM-DD" format.
 * Handles both "YYYY-MM-DD" and "YYYY-MM-DD HH:mm:ss" formats.
 *
 * @param date - Date string (with or without time) or Dayjs object
 * @returns Normalized date key in "YYYY-MM-DD" format
 *
 * @example
 * getDateKey("2024-12-15") // "2024-12-15"
 * getDateKey("2024-12-15 14:30:00") // "2024-12-15"
 * getDateKey(dayjs()) // "2024-12-15"
 */
export function getDateKey(date: string | Dayjs): string {
  return dayjs(date).format("YYYY-MM-DD");
}
