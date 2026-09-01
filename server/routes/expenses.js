import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all(
    `SELECT ec.*, e.name as employee_name, s.code as service_code
     FROM expense_claims ec
     LEFT JOIN employees e ON e.employee_id = ec.employee_id
     LEFT JOIN services s ON s.service_id = ec.service_id
     WHERE ec.tenant_id = ?
     ORDER BY ec.date DESC`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function create(req, res) {
  const id = uuid();
  const { employeeId, amount, serviceId, description, date } = req.body;
  await run(
    `INSERT INTO expense_claims (claim_id, tenant_id, employee_id, amount, service_id, status, description, date)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [id, req.user.tenantId, employeeId || null, amount, serviceId || null, description || null, date]
  );
  await logAudit(req, 'CREATE', 'expense_claims', id, null, req.body);
  res.status(201).json(await get('SELECT * FROM expense_claims WHERE claim_id = ?', [id]));
}

export async function approve(req, res) {
  const claim = await get('SELECT * FROM expense_claims WHERE claim_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!claim) return res.status(404).json({ error: 'Expense claim not found' });
  await run('UPDATE expense_claims SET status = ? WHERE claim_id = ?', ['approved', req.params.id]);
  await logAudit(req, 'APPROVE', 'expense_claims', req.params.id, claim, { status: 'approved' });
  res.json(await get('SELECT * FROM expense_claims WHERE claim_id = ?', [req.params.id]));
}
