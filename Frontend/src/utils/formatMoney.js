/**
 * Format a numeric value as Indian Rupees (INR).
 *
 * Uses Indian numbering system (lakhs, crores) when using
 * the `en-IN` locale. Falls back to standard grouping.
 *
 * Always prefixes with ₹ and shows 2 decimal places.
 *
 * @param {number} amount - The numeric amount to format.
 * @param {object} [options] - Optional overrides.
 * @param {boolean} [options.abs=false] - Show absolute value (strip sign).
 * @param {boolean} [options.noSymbol=false] - Omit the ₹ prefix.
 * @returns {string} Formatted money string, e.g. "₹ 7,932,000.00"
 */
export function formatMoney(amount, options = {}) {
  const { abs = false, noSymbol = false } = options;

  if (amount == null || Number.isNaN(Number(amount))) {
    return noSymbol ? "0.00" : "₹ 0.00";
  }

  const value = abs ? Math.abs(amount) : Number(amount);
  const formatted = value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return noSymbol ? formatted : `₹ ${formatted}`;
}

/**
 * Shortcut for formatting without the ₹ symbol.
 * Useful inside inputs or when the symbol is shown elsewhere.
 */
export function formatAmount(amount) {
  return formatMoney(amount, { noSymbol: true });
}

export default formatMoney;
