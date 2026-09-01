import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';

export async function list(req, res) {
  const rows = await all(
    `SELECT p.*, c.name as customer_name, i.invoice_id as linked_invoice
     FROM payments p
     JOIN customers c ON c.customer_id = p.customer_id
     LEFT JOIN invoices i ON i.invoice_id = p.invoice_id
     WHERE p.tenant_id = ?
     ORDER BY p.date DESC`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function create(req, res) {
  const id = uuid();
  const { customerId, invoiceId, bankAccountId, amount, date, method, reference } = req.body;
  await run(
    `INSERT INTO payments (payment_id, tenant_id, customer_id, invoice_id, bank_account_id, amount, date, method, reference)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.tenantId, customerId, invoiceId || null, bankAccountId || null, amount, date, method || 'ACH', reference || null]
  );

  if (invoiceId) {
    await run('UPDATE invoices SET status = ? WHERE invoice_id = ? AND tenant_id = ?', ['paid', invoiceId, req.user.tenantId]);
  }

  if (bankAccountId) {
    await run(
      'UPDATE bank_accounts SET balance = balance + ? WHERE bank_account_id = ?',
      [amount, bankAccountId]
    );
    await run(
      `INSERT INTO bank_transactions (txn_id, bank_account_id, date, amount, description, matched_invoice_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'matched')`,
      [uuid(), bankAccountId, date, amount, `Payment ${reference || id}`, invoiceId || null]
    );
  }

  await logAudit(req, 'CREATE', 'payments', id, null, req.body);
  res.status(201).json(await get('SELECT * FROM payments WHERE payment_id = ?', [id]));
}
