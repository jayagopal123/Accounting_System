import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Standard Indian business date formatting: "dd MMM yyyy" (e.g., "24 Sep 2026")
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = "dd MMM yyyy"
): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (isNaN(d.getTime())) return "—";
    return format(d, formatStr);
  } catch {
    return "—";
  }
}

/**
 * Date + Time formatting: "dd MMM yyyy, hh:mm a"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd MMM yyyy, hh:mm a");
}

/**
 * ISO date string for input elements: "yyyy-MM-dd"
 */
export function toInputDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (isNaN(d.getTime())) return "";
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * Relative time from now (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}
