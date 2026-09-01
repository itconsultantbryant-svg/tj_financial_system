import { v4 as uuid } from 'uuid';
import { run } from '../db/adapter.js';

export async function logAudit(req, action, entity, entityId, before, after) {
  const tenantId = req.user?.tenantId || 'tenant-tj-consultancy';
  const userId = req.user?.userId || null;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  await run(
    `INSERT INTO audit_log (log_id, tenant_id, user_id, action, entity, entity_id, before_json, after_json, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid(),
      tenantId,
      userId,
      action,
      entity,
      entityId,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null,
      ip,
    ]
  );
}
