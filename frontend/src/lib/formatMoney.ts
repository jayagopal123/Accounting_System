/**
 * Formats a numeric value into INR currency with Indian lakh/crore grouping (en-IN).
 * Always 2 decimal places.
 * Example: 1250000.5 -> "₹12,50,000.50"
 */
export function formatMoney(
  amount: number | string | null | undefined,
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
    fallback?: string;
  }
): string {
  const { showSymbol = true, compact = false, fallback = "₹0.00" } = options || {};

  if (amount === null || amount === undefined || amount === "") {
    return fallback;
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return fallback;
  }

  if (compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    const prefix = showSymbol ? "₹" : "";
    if (abs >= 10000000) {
      return `${sign}${prefix}${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${prefix}${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${prefix}${(abs / 1000).toFixed(2)} K`;
    }
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}

/**
 * Parses an INR string back to a numeric float
 */
export function parseMoney(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
