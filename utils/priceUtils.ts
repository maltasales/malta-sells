// Utility function to format prices consistently across the app
export function formatPrice(price: number, currency: string = '€'): string {
  // Remove any "EUR" prefix and use proper € symbol
  const cleanCurrency = currency === 'EUR' ? '€' : currency;
  
  // Format number with thousand separators
  const formattedNumber = price.toLocaleString('en-US');
  
  // Return with space after currency symbol
  return `${cleanCurrency} ${formattedNumber}`;
}

// Legacy support - converts old format to new format
export function convertLegacyPrice(priceString: string): string {
  // Handle cases like "EUR250000/" or "€250000/"
  const match = priceString.match(/(EUR|€)(\d+)(\/)?/);
  if (match) {
    const [, currency, amount] = match;
    const numericAmount = parseInt(amount, 10);
    return formatPrice(numericAmount, currency);
  }
  
  // If no match, return as is
  return priceString;
}