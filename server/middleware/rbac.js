import { all, get } from '../db/adapter.js';

export async function getUserPermissions(userId) {
  const roles = await all(
    `SELECT r.permissions FROM user_roles ur
     JOIN roles r ON r.role_id = ur.role_id
     WHERE ur.user_id = ?`,
    [userId]
  );

  const modules = new Set();
  let canCreate = false;
  let canEdit = false;
  let canApprove = false;
  let canView = false;

  for (const row of roles) {
    const perms = JSON.parse(row.permissions);
    if (perms.modules?.includes('*')) {
      return { modules: ['*'], create: true, edit: true, approve: true, view: true };
    }
    perms.modules?.forEach((m) => modules.add(m));
    if (perms.create) canCreate = true;
    if (perms.edit) canEdit = true;
    if (perms.approve) canApprove = true;
    if (perms.view) canView = true;
  }

  return {
    modules: Array.from(modules),
    create: canCreate,
    edit: canEdit,
    approve: canApprove,
    view: canView,
  };
}

export function requireModule(moduleName) {
  return async (req, res, next) => {
    const perms = await getUserPermissions(req.user.userId);
    if (perms.modules.includes('*') || perms.modules.includes(moduleName)) {
      req.permissions = perms;
      return next();
    }
    return res.status(403).json({ error: 'Access denied' });
  };
}

export async function attachPermissions(req, res, next) {
  req.permissions = await getUserPermissions(req.user.userId);
  next();
}
