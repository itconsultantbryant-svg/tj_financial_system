import { get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';
import { CURRENCY, COUNTRY, COUNTRY_CODE, LOCALE, TIMEZONE } from '../constants.js';
import { formatTenant, parseBranding } from '../utils/tenant.js';

export async function getTenantSettings(req, res) {
  const tenant = await get('SELECT * FROM tenants WHERE tenant_id = ?', [req.user.tenantId]);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  res.json({
    ...formatTenant(tenant),
    tenantId: tenant.tenant_id,
    fiscalYearStart: tenant.fiscal_year_start,
    defaultTaxCode: tenant.default_tax_code,
  });
}

export async function updateTenantSettings(req, res) {
  const tenant = await get('SELECT * FROM tenants WHERE tenant_id = ?', [req.user.tenantId]);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const branding = parseBranding(tenant.branding);
  const { tagline, primaryColor, secondaryColor } = req.body;

  const updatedBranding = {
    ...branding,
    company: tenant.tenant_name,
    country: COUNTRY,
    countryCode: COUNTRY_CODE,
    locale: LOCALE,
    timezone: TIMEZONE,
    currency: CURRENCY,
  };

  await run(
    `UPDATE tenants SET currency = ?, tagline = ?, primary_color = ?, secondary_color = ?, branding = ?
     WHERE tenant_id = ?`,
    [
      CURRENCY,
      tagline ?? tenant.tagline,
      primaryColor ?? tenant.primary_color,
      secondaryColor ?? tenant.secondary_color,
      JSON.stringify(updatedBranding),
      req.user.tenantId,
    ]
  );

  await run('UPDATE bank_accounts SET currency = ? WHERE tenant_id = ?', [CURRENCY, req.user.tenantId]);

  await logAudit(req, 'UPDATE', 'tenants', req.user.tenantId, tenant, { currency: CURRENCY, country: COUNTRY });

  return getTenantSettings(req, res);
}
