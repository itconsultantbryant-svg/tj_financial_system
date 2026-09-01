import { v4 as uuid } from 'uuid';
import { run } from '../db/adapter.js';

export async function postJournal(req, { description, sourceModule, sourceId, date, lines }) {
  const journalId = uuid();
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error('Journal entry must balance: debit must equal credit');
  }

  await run(
    `INSERT INTO journal_entries (journal_id, tenant_id, date, description, source_module, source_id, posted_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'posted')`,
    [
      journalId,
      req.user.tenantId,
      date,
      description,
      sourceModule,
      sourceId,
      req.user.userId,
    ]
  );

  for (const line of lines) {
    await run(
      `INSERT INTO journal_lines (line_id, journal_id, account_id, debit, credit, service_id, customer_id, vendor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        journalId,
        line.accountId,
        line.debit || 0,
        line.credit || 0,
        line.serviceId || null,
        line.customerId || null,
        line.vendorId || null,
      ]
    );
  }

  return journalId;
}
