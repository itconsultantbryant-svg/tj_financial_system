import { all } from '../db/adapter.js';

export async function list(req, res) {
  const rows = await all('SELECT * FROM vendors WHERE tenant_id = ? ORDER BY name', [req.user.tenantId]);
  res.json(rows);
}
