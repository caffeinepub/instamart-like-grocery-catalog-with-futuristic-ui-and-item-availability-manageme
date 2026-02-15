/**
 * Format a price value in Indian Rupees (INR)
 * @param priceInPaise - The price stored as paise (1/100 of a rupee)
 * @returns Formatted price string with INR symbol
 */
export function formatINR(priceInPaise: bigint | number): string {
  const priceInRupees = Number(priceInPaise) / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceInRupees);
}
