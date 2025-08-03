import { Currency } from '../types';

// Mock exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES = {
  EUR: {
    USD: 1.08,
    GBP: 0.86,
    EUR: 1,
  },
  USD: {
    EUR: 0.93,
    GBP: 0.80,
    USD: 1,
  },
  GBP: {
    EUR: 1.16,
    USD: 1.25,
    GBP: 1,
  },
};

export class CurrencyConverter {
  static convert(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
    return amount * rate;
  }

  static formatCurrency(amount: number, currency: Currency): string {
    const currencySymbols = {
      EUR: '€',
      USD: '$',
      GBP: '£',
    };

    return `${amount.toFixed(2)} ${currencySymbols[currency]}`;
  }

  static getAlternativeCurrencies(amount: number, baseCurrency: Currency): Record<Currency, string> {
    const alternatives: Record<Currency, string> = {} as Record<Currency, string>;
    
    Object.values(['EUR', 'USD', 'GBP'] as Currency[]).forEach(currency => {
      if (currency !== baseCurrency) {
        const converted = this.convert(amount, baseCurrency, currency);
        alternatives[currency] = this.formatCurrency(converted, currency);
      }
    });

    return alternatives;
  }
} 