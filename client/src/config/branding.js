export const BRAND = {
  name: 'TJ CONSULTANCY INC.',
  shortName: 'TJ Consultancy',
  tagline: 'Advisory, Strategy & Financial Excellence — Monrovia, Liberia',
  logoUrl: '/logo.png',
  primaryColor: '#1a365d',
  secondaryColor: '#c9a227',
  currency: 'USD',
  country: 'Liberia',
  countryCode: 'LR',
  locale: 'en-LR',
  timezone: 'Africa/Monrovia',
};

export function formatCurrency(amount, currency = 'USD') {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(amount) {
  return new Intl.NumberFormat('en-US').format(Number(amount) || 0);
}
