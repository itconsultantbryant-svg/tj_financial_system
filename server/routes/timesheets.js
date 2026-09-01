import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all(
    `SELECT t.*, so.description as service_order_desc, e.name as employee_name, s.code as service_code
     FROM timesheets t
     LEFT JOIN service_orders so ON so.service_order_id = t.service_order_id
     LEFT JOIN employees e ON e.employee_id = t.employee_id
     LEFT JOIN services s ON s.service_id = so.service_id
     WHERE t.tenant_id = ?
     ORDER BY t.date DESC LIMIT 200`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function create(req, res) {
  const id = uuid();
  const { serviceOrderId, employeeId, date, hours, description, deliverable } = req.body;
  await run(
    `INSERT INTO timesheets (timesheet_id, tenant_id, service_order_id, employee_id, date, hours, description, deliverable)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.tenantId, serviceOrderId, employeeId || null, date, hours || 0, description || null, deliverable || null]
  );
  await logAudit(req, 'CREATE', 'timesheets', id, null, req.body);
  res.status(201).json(await get('SELECT * FROM timesheets WHERE timesheet_id = ?', [id]));
}
