import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all('SELECT * FROM assets WHERE tenant_id = ? ORDER BY acq_date DESC', [req.user.tenantId]);
  res.json(rows);
}

export async function create(req, res) {
  const id = uuid();
  const { name, cost, acqDate, depreciationMethod, usefulLifeYears } = req.body;
  await run(
    `INSERT INTO assets (asset_id, tenant_id, name, cost, acq_date, depreciation_method, nbv, useful_life_years)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      req.user.tenantId,
      name,
      cost,
      acqDate,
      depreciationMethod || 'straight_line',
      cost,
      usefulLifeYears || 5,
    ]
  );
  await logAudit(req, 'CREATE', 'assets', id, null, req.body);
  res.status(201).json(await get('SELECT * FROM assets WHERE asset_id = ?', [id]));
}

export async function depreciationSchedule(req, res) {
  const assets = await all('SELECT * FROM assets WHERE tenant_id = ?', [req.user.tenantId]);
  const schedule = assets.map((a) => {
    const cost = Number(a.cost);
    const nbv = Number(a.nbv || cost);
    const years = Number(a.useful_life_years || 5);
    const annualDep = cost / years;
    return {
      assetId: a.asset_id,
      name: a.name,
      cost,
      nbv,
      annualDepreciation: annualDep,
      method: a.depreciation_method,
    };
  });
  res.json(schedule);
}
