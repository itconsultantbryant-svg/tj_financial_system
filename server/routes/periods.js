import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all(
    'SELECT * FROM fiscal_periods WHERE tenant_id = ? ORDER BY year, month',
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function closePeriod(req, res) {
  const period = await get('SELECT * FROM fiscal_periods WHERE period_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!period) return res.status(404).json({ error: 'Period not found' });
  if (period.status === 'locked') return res.status(400).json({ error: 'Period already locked' });

  await run(
    'UPDATE fiscal_periods SET status = ?, locked_by = ?, locked_at = ? WHERE period_id = ?',
    ['locked', req.user.userId, new Date().toISOString(), req.params.id]
  );
  await logAudit(req, 'LOCK_PERIOD', 'fiscal_periods', req.params.id, period, { status: 'locked' });
  res.json(await get('SELECT * FROM fiscal_periods WHERE period_id = ?', [req.params.id]));
}

export async function reopenPeriod(req, res) {
  const perms = req.permissions;
  if (!perms.approve && !perms.modules?.includes('*')) {
    return res.status(403).json({ error: 'Finance Director approval required to reopen period' });
  }
  const period = await get('SELECT * FROM fiscal_periods WHERE period_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!period) return res.status(404).json({ error: 'Period not found' });
  await run('UPDATE fiscal_periods SET status = ?, locked_by = NULL, locked_at = NULL WHERE period_id = ?', [
    'open',
    req.params.id,
  ]);
  await logAudit(req, 'REOPEN_PERIOD', 'fiscal_periods', req.params.id, period, { status: 'open' });
  res.json(await get('SELECT * FROM fiscal_periods WHERE period_id = ?', [req.params.id]));
}
