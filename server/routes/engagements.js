import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all(
    `SELECT e.*, c.name as customer_name FROM engagements e
     JOIN customers c ON c.customer_id = e.customer_id
     WHERE e.tenant_id = ? ORDER BY e.start_date DESC`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function getById(req, res) {
  const row = await get(
    `SELECT e.*, c.name as customer_name FROM engagements e
     JOIN customers c ON c.customer_id = e.customer_id
     WHERE e.engagement_id = ? AND e.tenant_id = ?`,
    [req.params.id, req.user.tenantId]
  );
  if (!row) return res.status(404).json({ error: 'Engagement not found' });
  const serviceOrders = await all(
    `SELECT so.*, s.code as service_code, s.name as service_name FROM service_orders so
     JOIN services s ON s.service_id = so.service_id
     WHERE so.engagement_id = ?`,
    [req.params.id]
  );
  res.json({ ...row, serviceOrders });
}

export async function create(req, res) {
  const id = uuid();
  const { customerId, type, title, startDate, endDate, monthlyFee, milestoneSchedule, retentionPct } = req.body;
  await run(
    `INSERT INTO engagements (engagement_id, tenant_id, customer_id, type, title, start_date, end_date, status, monthly_fee, retainer_balance, milestone_schedule, retention_pct)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    [
      id,
      req.user.tenantId,
      customerId,
      type,
      title,
      startDate,
      endDate || null,
      monthlyFee || 0,
      monthlyFee || 0,
      milestoneSchedule ? JSON.stringify(milestoneSchedule) : null,
      retentionPct || 0,
    ]
  );
  await logAudit(req, 'CREATE', 'engagements', id, null, req.body);
  const row = await get('SELECT * FROM engagements WHERE engagement_id = ?', [id]);
  res.status(201).json(row);
}
