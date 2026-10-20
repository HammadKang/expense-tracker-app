export type CurrencyCode = 'PKR' | 'SAR';

export type Currency = {
  code: CurrencyCode;
  name: string;
  flag: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'PKR';

export const getCurrency = (code?: string): Currency =>
  CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];

// Expenses saved before currencies existed have no code and are PKR.
export const currencyOf = (e: { currency?: string }): CurrencyCode =>
  getCurrency(e.currency).code;
