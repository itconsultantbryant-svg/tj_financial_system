import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function listEmployees(req, res) {
  const rows = await all('SELECT * FROM employees WHERE tenant_id = ? ORDER BY name', [req.user.tenantId]);
  res.json(rows);
}

export async function listRuns(req, res) {
  const rows = await all(
    'SELECT * FROM payroll_runs WHERE tenant_id = ? ORDER BY period DESC',
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function createRun(req, res) {
  const id = uuid();
  const { period, totalGross, paye, pension, netPay } = req.body;
  await run(
    `INSERT INTO payroll_runs (payroll_run_id, tenant_id, period, total_gross, paye, pension, net_pay, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
    [id, req.user.tenantId, period, totalGross || 0, paye || 0, pension || 0, netPay || 0]
  );
  await logAudit(req, 'CREATE', 'payroll_runs', id, null, req.body);
  res.status(201).json(await get('SELECT * FROM payroll_runs WHERE payroll_run_id = ?', [id]));
}

export async function postRun(req, res) {
  const payrollRun = await get('SELECT * FROM payroll_runs WHERE payroll_run_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!payrollRun) return res.status(404).json({ error: 'Payroll run not found' });
  await run('UPDATE payroll_runs SET status = ? WHERE payroll_run_id = ?', ['posted', req.params.id]);
  await logAudit(req, 'POST', 'payroll_runs', req.params.id, payrollRun, { status: 'posted' });
  res.json(await get('SELECT * FROM payroll_runs WHERE payroll_run_id = ?', [req.params.id]));
}
