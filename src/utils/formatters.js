// src/utils/formatters.js

/**
 * Formats a number as USD currency, e.g. 1,234.56 → $1,234.56
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Formats a number without currency symbol, e.g. 1234.56 → 1,234.56
 * @param {number} amount 
 * @param {number} fractionDigits 
 */
export function formatNumber(amount, fractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount || 0);
}
