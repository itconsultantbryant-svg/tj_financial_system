import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all(
    `SELECT b.*, v.name as vendor_name FROM bills b
     JOIN vendors v ON v.vendor_id = b.vendor_id
     WHERE b.tenant_id = ? ORDER BY b.due_date DESC`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function create(req, res) {
  const id = uuid();
  const { vendorId, amount, dueDate, wht, engagementId, lines } = req.body;
  await run(
    `INSERT INTO bills (bill_id, tenant_id, vendor_id, amount, due_date, wht, status, engagement_id)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [id, req.user.tenantId, vendorId, amount, dueDate, wht || 0, engagementId || null]
  );
  for (const line of lines || []) {
    await run(
      `INSERT INTO bill_lines (bill_line_id, bill_id, service_id, amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [uuid(), id, line.serviceId || null, line.amount || 0, line.description || null]
    );
  }
  await logAudit(req, 'CREATE', 'bills', id, null, req.body);
  const row = await get('SELECT * FROM bills WHERE bill_id = ?', [id]);
  res.status(201).json(row);
}

export async function approve(req, res) {
  const bill = await get('SELECT * FROM bills WHERE bill_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  await run('UPDATE bills SET status = ? WHERE bill_id = ?', ['approved', req.params.id]);
  await logAudit(req, 'APPROVE', 'bills', req.params.id, bill, { status: 'approved' });
  res.json(await get('SELECT * FROM bills WHERE bill_id = ?', [req.params.id]));
}
