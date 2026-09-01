import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { CURRENCY } from '../constants.js';

export async function listAccounts(req, res) {
  const rows = await all('SELECT * FROM bank_accounts WHERE tenant_id = ?', [req.user.tenantId]);
  res.json(rows);
}

export async function listTransactions(req, res) {
  const accountId = req.query.accountId;
  let sql = `SELECT bt.*, ba.bank_name, ba.account_no FROM bank_transactions bt
    JOIN bank_accounts ba ON ba.bank_account_id = bt.bank_account_id
    WHERE ba.tenant_id = ?`;
  const params = [req.user.tenantId];
  if (accountId) {
    sql += ' AND bt.bank_account_id = ?';
    params.push(accountId);
  }
  sql += ' ORDER BY bt.date DESC LIMIT 200';
  res.json(await all(sql, params));
}

export async function reconciliationSummary(req, res) {
  const accounts = await all('SELECT * FROM bank_accounts WHERE tenant_id = ?', [req.user.tenantId]);
  const summary = [];
  for (const acc of accounts) {
    const matched = await get(
      `SELECT COUNT(*) as count FROM bank_transactions WHERE bank_account_id = ? AND status = 'matched'`,
      [acc.bank_account_id]
    );
    const unmatched = await get(
      `SELECT COUNT(*) as count FROM bank_transactions WHERE bank_account_id = ? AND status = 'unmatched'`,
      [acc.bank_account_id]
    );
    const total = Number(matched?.count || 0) + Number(unmatched?.count || 0);
    summary.push({
      bankAccountId: acc.bank_account_id,
      bankName: acc.bank_name,
      accountNo: acc.account_no,
      balance: acc.balance,
      matched: Number(matched?.count || 0),
      unmatched: Number(unmatched?.count || 0),
      matchPct: total > 0 ? Math.round((Number(matched?.count || 0) / total) * 100) : 100,
    });
  }
  res.json(summary);
}

export async function importTransactions(req, res) {
  const { bankAccountId, transactions } = req.body;
  if (!bankAccountId || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'bankAccountId and transactions array required' });
  }

  const account = await get('SELECT * FROM bank_accounts WHERE bank_account_id = ? AND tenant_id = ?', [
    bankAccountId,
    req.user.tenantId,
  ]);
  if (!account) return res.status(404).json({ error: 'Bank account not found' });

  let imported = 0;
  for (const txn of transactions) {
    await run(
      `INSERT INTO bank_transactions (txn_id, bank_account_id, date, amount, description, status)
       VALUES (?, ?, ?, ?, ?, 'unmatched')`,
      [uuid(), bankAccountId, txn.date, txn.amount, txn.description || 'Imported transaction']
    );
    imported += 1;
  }

  res.json({ imported, currency: CURRENCY, bankAccountId });
}
