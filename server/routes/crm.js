import { v4 as uuid } from 'uuid';
import { all, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function listCoa(req, res) {
  const rows = await all('SELECT * FROM chart_of_accounts WHERE tenant_id = ? ORDER BY code', [req.user.tenantId]);
  res.json(rows);
}

export async function listLeads(req, res) {
  const rows = await all('SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC', [req.user.tenantId]);
  res.json(rows);
}

export async function createLead(req, res) {
  const id = uuid();
  const { name, email, phone, source, score, status, assignedTo } = req.body;
  await run(
    `INSERT INTO leads (lead_id, tenant_id, name, email, phone, source, score, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.tenantId, name, email || null, phone || null, source || 'web', score || 0, status || 'new', assignedTo || null]
  );
  await logAudit(req, 'CREATE', 'leads', id, null, req.body);
  const rows = await all('SELECT * FROM leads WHERE lead_id = ?', [id]);
  res.status(201).json(rows[0]);
}
