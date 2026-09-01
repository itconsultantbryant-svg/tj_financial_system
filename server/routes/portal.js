import { all, get } from '../db/adapter.js';
import { CURRENCY } from '../constants.js';

async function getCustomerForPortalUser(req) {
  const user = await get('SELECT email FROM users WHERE user_id = ?', [req.user.userId]);
  if (!user) return null;
  return get('SELECT * FROM customers WHERE tenant_id = ? AND email = ?', [req.user.tenantId, user.email]);
}

export async function dashboard(req, res) {
  const customer = await getCustomerForPortalUser(req);
  if (!customer) return res.status(403).json({ error: 'No customer account linked to this portal user' });

  const invoices = await all(
    `SELECT invoice_id, issue_date, due_date, total_amount, tax_amount, status
     FROM invoices WHERE customer_id = ? AND tenant_id = ?
     ORDER BY issue_date DESC`,
    [customer.customer_id, req.user.tenantId]
  );
  const payments = await all(
    `SELECT payment_id, date, amount, method, reference
     FROM payments WHERE customer_id = ? AND tenant_id = ?
     ORDER BY date DESC`,
    [customer.customer_id, req.user.tenantId]
  );
  const balance = invoices
    .filter((i) => i.status === 'approved' || i.status === 'sent')
    .reduce((s, i) => s + Number(i.total_amount), 0);

  res.json({
    currency: CURRENCY,
    customer: { id: customer.customer_id, name: customer.name, email: customer.email },
    openBalance: balance,
    invoices,
    payments,
  });
}

export async function statement(req, res) {
  const customer = await getCustomerForPortalUser(req);
  if (!customer) return res.status(403).json({ error: 'No customer account linked' });

  const invoices = await all(
    `SELECT * FROM invoices WHERE customer_id = ? AND tenant_id = ? ORDER BY issue_date`,
    [customer.customer_id, req.user.tenantId]
  );
  const payments = await all(
    `SELECT * FROM payments WHERE customer_id = ? AND tenant_id = ? ORDER BY date`,
    [customer.customer_id, req.user.tenantId]
  );

  res.json({
    currency: CURRENCY,
    customerName: customer.name,
    generatedAt: new Date().toISOString(),
    invoices,
    payments,
  });
}
