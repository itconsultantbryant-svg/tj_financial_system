import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { all, get, run } from '../db/adapter.js';
import { signToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import { getUserPermissions } from '../middleware/rbac.js';
import { formatTenant } from '../utils/tenant.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await get('SELECT * FROM users WHERE email = ? AND status = ?', [email, 'active']);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const roles = await all(
    `SELECT r.role_id, r.role_name FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE ur.user_id = ?`,
    [user.user_id]
  );

  const tenant = await get('SELECT * FROM tenants WHERE tenant_id = ?', [user.tenant_id]);
  const permissions = await getUserPermissions(user.user_id);

  const token = signToken({
    userId: user.user_id,
    tenantId: user.tenant_id,
    email: user.email,
    roles: roles.map((r) => r.role_name),
  });

  await logAudit(
    { user: { userId: user.user_id, tenantId: user.tenant_id }, ip: req.ip },
    'LOGIN',
    'users',
    user.user_id,
    null,
    { email: user.email }
  );

  res.json({
    token,
    user: {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      roles: roles.map((r) => ({ id: r.role_id, name: r.role_name })),
      permissions,
    },
    tenant: formatTenant(tenant),
  });
}

export async function getMe(req, res) {
  const user = await get('SELECT user_id, full_name, email, tenant_id, status FROM users WHERE user_id = ?', [
    req.user.userId,
  ]);
  const roles = await all(
    `SELECT r.role_id, r.role_name FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE ur.user_id = ?`,
    [req.user.userId]
  );
  const tenant = await get('SELECT * FROM tenants WHERE tenant_id = ?', [user.tenant_id]);
  const permissions = await getUserPermissions(req.user.userId);

  res.json({
    user: {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      roles: roles.map((r) => ({ id: r.role_id, name: r.role_name })),
      permissions,
    },
    tenant: formatTenant(tenant),
  });
}
