// src/utils/currency.ts

/** Convierte de formato decimal (ej: 1500.50) a centavos (150050) */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convierte de centavos (150050) a formato decimal (1500.50) */
export function fromCents(cents: number): number {
  return cents / 100;
}

/** Formatea centavos como string de moneda legible */
export function formatCurrency(cents: number, locale = 'es-CL', currency = 'CLP'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(fromCents(cents));
}