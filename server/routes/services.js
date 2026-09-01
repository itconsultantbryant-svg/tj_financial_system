import { all } from '../db/adapter.js';

export async function list(req, res) {
  const rows = await all(
  `SELECT s.*, ra.code as revenue_code, ra.name as revenue_name, ca.code as cogs_code, ca.name as cogs_name
   FROM services s
   LEFT JOIN chart_of_accounts ra ON ra.account_id = s.revenue_account_id
   LEFT JOIN chart_of_accounts ca ON ca.account_id = s.cogs_account_id
   WHERE s.tenant_id = ? ORDER BY s.code`,
    [req.user.tenantId]
  );
  res.json(rows);
}
