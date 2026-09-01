import { all, get } from '../db/adapter.js';
import { postJournal } from '../utils/journal.js';

export async function list(req, res) {
  const rows = await all(
    `SELECT * FROM journal_entries WHERE tenant_id = ? ORDER BY date DESC LIMIT 100`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function getById(req, res) {
  const entry = await get('SELECT * FROM journal_entries WHERE journal_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!entry) return res.status(404).json({ error: 'Journal not found' });
  const lines = await all(
    `SELECT jl.*, a.code as account_code, a.name as account_name FROM journal_lines jl
     JOIN chart_of_accounts a ON a.account_id = jl.account_id
     WHERE jl.journal_id = ?`,
    [req.params.id]
  );
  res.json({ ...entry, lines });
}

export async function trialBalance(req, res) {
  const rows = await all(
    `SELECT a.code, a.name, a.type,
       COALESCE(SUM(jl.debit), 0) as total_debit,
       COALESCE(SUM(jl.credit), 0) as total_credit,
       COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0) as balance
     FROM chart_of_accounts a
     LEFT JOIN journal_lines jl ON jl.account_id = a.account_id
     LEFT JOIN journal_entries je ON je.journal_id = jl.journal_id AND je.status = 'posted'
     WHERE a.tenant_id = ?
     GROUP BY a.account_id
     ORDER BY a.code`,
    [req.user.tenantId]
  );
  const totalDebit = rows.reduce((s, r) => s + Number(r.total_debit), 0);
  const totalCredit = rows.reduce((s, r) => s + Number(r.total_credit), 0);
  res.json({ rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 });
}

export async function createManual(req, res) {
  try {
    const journalId = await postJournal(req, req.body);
    res.status(201).json(await get('SELECT * FROM journal_entries WHERE journal_id = ?', [journalId]));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
