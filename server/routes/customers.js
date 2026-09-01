import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all('SELECT * FROM customers WHERE tenant_id = ? ORDER BY name', [req.user.tenantId]);
  res.json(rows);
}

export async function getById(req, res) {
  const row = await get('SELECT * FROM customers WHERE customer_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!row) return res.status(404).json({ error: 'Customer not found' });
  const engagements = await all('SELECT * FROM engagements WHERE customer_id = ?', [req.params.id]);
  const invoices = await all('SELECT * FROM invoices WHERE customer_id = ? ORDER BY issue_date DESC', [req.params.id]);
  res.json({ ...row, engagements, invoices });
}

export async function create(req, res) {
  const id = uuid();
  const { name, address, taxId, email, phone, creditLimit, portalAccess } = req.body;
  await run(
    `INSERT INTO customers (customer_id, tenant_id, name, address, tax_id, email, phone, credit_limit, portal_access, kyc_status, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'active')`,
    [
      id,
      req.user.tenantId,
      name,
      address || null,
      taxId || null,
      email || null,
      phone || null,
      creditLimit || 0,
      portalAccess ? 1 : 0,
    ]
  );
  await logAudit(req, 'CREATE', 'customers', id, null, req.body);
  const row = await get('SELECT * FROM customers WHERE customer_id = ?', [id]);
  res.status(201).json(row);
}

export async function update(req, res) {
  const before = await get('SELECT * FROM customers WHERE customer_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!before) return res.status(404).json({ error: 'Customer not found' });

  const { name, address, taxId, email, phone, creditLimit, portalAccess, status } = req.body;
  await run(
    `UPDATE customers SET name = ?, address = ?, tax_id = ?, email = ?, phone = ?, credit_limit = ?, portal_access = ?, status = ?
     WHERE customer_id = ? AND tenant_id = ?`,
    [
      name ?? before.name,
      address ?? before.address,
      taxId ?? before.tax_id,
      email ?? before.email,
      phone ?? before.phone,
      creditLimit ?? before.credit_limit,
      portalAccess !== undefined ? (portalAccess ? 1 : 0) : before.portal_access,
      status ?? before.status,
      req.params.id,
      req.user.tenantId,
    ]
  );
  const after = await get('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
  await logAudit(req, 'UPDATE', 'customers', req.params.id, before, after);
  res.json(after);
}
