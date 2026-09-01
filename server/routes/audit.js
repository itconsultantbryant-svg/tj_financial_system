import { all } from '../db/adapter.js';

export async function list(req, res) {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
  const rows = await all(
    `SELECT al.*, u.full_name as user_name FROM audit_log al
     LEFT JOIN users u ON u.user_id = al.user_id
     WHERE al.tenant_id = ?
     ORDER BY al.timestamp DESC LIMIT ?`,
    [req.user.tenantId, limit]
  );
  res.json(rows);
}
