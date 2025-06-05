
import { AVAILABLE_CURRENCIES, SELECTED_CURRENCY_LS_KEY, type CurrencyDefinition, type CurrencyCode } from './constants';

const DEFAULT_CURRENCY_CODE: CurrencyCode = 'USD';

export function getSelectedCurrencyDefinition(): CurrencyDefinition {
  if (typeof window === 'undefined') {
    // Default for server-side rendering or environments without window
    return AVAILABLE_CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE) || AVAILABLE_CURRENCIES[0];
  }
  const storedCurrencyCode = localStorage.getItem(SELECTED_CURRENCY_LS_KEY) as CurrencyCode | null;
  const currency = AVAILABLE_CURRENCIES.find(c => c.code === storedCurrencyCode);
  return currency || AVAILABLE_CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE) || AVAILABLE_CURRENCIES[0];
}

export function formatCurrency(value: number | undefined | null, currencyCodeToUse?: CurrencyCode): string {
  if (value === undefined || value === null) {
    // Handle undefined or null values, perhaps return a placeholder or empty string
    // For now, let's find the symbol and prefix with 0.00 or return placeholder.
    const definition = currencyCodeToUse
    ? AVAILABLE_CURRENCIES.find(c => c.code === currencyCodeToUse)
    : getSelectedCurrencyDefinition();
    const effectiveDefinition = definition || AVAILABLE_CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE) || AVAILABLE_CURRENCIES[0];
    return `${effectiveDefinition.symbol}0.00`; // Or some other placeholder like 'N/A'
  }

  const definition = currencyCodeToUse
    ? AVAILABLE_CURRENCIES.find(c => c.code === currencyCodeToUse)
    : getSelectedCurrencyDefinition();

  const effectiveDefinition = definition || AVAILABLE_CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE) || AVAILABLE_CURRENCIES[0];

  // Simple formatting, can be enhanced with Intl.NumberFormat for locale-specifics
  return `${effectiveDefinition.symbol}${value.toFixed(2)}`;
}
