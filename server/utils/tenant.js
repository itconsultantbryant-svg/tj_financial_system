import { CURRENCY, COUNTRY, COUNTRY_CODE, LOCALE, TIMEZONE } from '../constants.js';

export function parseBranding(raw) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function formatTenant(tenant) {
  if (!tenant) return null;
  const branding = parseBranding(tenant.branding);
  return {
    id: tenant.tenant_id,
    name: tenant.tenant_name,
    currency: CURRENCY,
    country: branding.country || COUNTRY,
    countryCode: branding.countryCode || COUNTRY_CODE,
    locale: branding.locale || LOCALE,
    timezone: branding.timezone || TIMEZONE,
    primaryColor: tenant.primary_color,
    secondaryColor: tenant.secondary_color,
    tagline: tenant.tagline,
    logoUrl: tenant.logo_url,
  };
}
