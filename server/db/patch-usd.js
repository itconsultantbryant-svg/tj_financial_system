import { all, run } from './adapter.js';
import { CURRENCY, COUNTRY, COUNTRY_CODE, LOCALE } from '../constants.js';

const TENANT_ID = 'tenant-tj-consultancy';

async function patch() {
  const tenants = await all('SELECT tenant_id FROM tenants');
  if (!tenants.length) {
    console.log('No tenants found — run db:seed first');
    return;
  }

  const branding = JSON.stringify({
    company: 'TJ CONSULTANCY INC.',
    country: COUNTRY,
    countryCode: COUNTRY_CODE,
    locale: LOCALE,
    currency: CURRENCY,
  });

  await run(
    'UPDATE tenants SET currency = ?, branding = ?, tagline = ? WHERE tenant_id = ?',
  [
      CURRENCY,
      branding,
      'Advisory, Strategy & Financial Excellence — Monrovia, Liberia',
      TENANT_ID,
    ]
  );

  await run('UPDATE bank_accounts SET currency = ? WHERE tenant_id = ?', [CURRENCY, TENANT_ID]);
  await run(
    'UPDATE bank_accounts SET bank_name = ? WHERE tenant_id = ? AND bank_name IN (?, ?, ?)',
    ['Ecobank Liberia', TENANT_ID, 'GTBank', 'Chase Bank', 'GT Bank']
  );
  await run(
    'UPDATE customers SET email = ? WHERE customer_id = ? AND email LIKE ?',
    ['procurement@gov.lr', 'cust-c', '%gov.ng%']
  );
  await run(
    'UPDATE tax_codes SET code = ?, type = ? WHERE tenant_id = ? AND code = ?',
    ['SALES_TAX', 'SALES_TAX', TENANT_ID, 'VAT']
  );

  console.log(`Patched tenant: currency=${CURRENCY}, country=${COUNTRY}`);
  console.log('Bank accounts and customer references updated for Liberia');
}

patch().catch((err) => {
  console.error('Patch failed:', err);
  process.exit(1);
});
