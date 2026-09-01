import { v4 as uuid } from 'uuid';
import { all, get, run } from '../db/adapter.js';
import { logAudit } from '../middleware/audit.js';
import { postJournal } from '../utils/journal.js';

export async function list(req, res) {
  const status = req.query.status;
  let sql = `SELECT i.*, c.name as customer_name FROM invoices i
     JOIN customers c ON c.customer_id = i.customer_id
     WHERE i.tenant_id = ?`;
  const params = [req.user.tenantId];
  if (status) {
    sql += ' AND i.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY i.issue_date DESC';
  const rows = await all(sql, params);
  res.json(rows);
}

export async function getById(req, res) {
  const row = await get(
    `SELECT i.*, c.name as customer_name FROM invoices i
     JOIN customers c ON c.customer_id = i.customer_id
     WHERE i.invoice_id = ? AND i.tenant_id = ?`,
    [req.params.id, req.user.tenantId]
  );
  if (!row) return res.status(404).json({ error: 'Invoice not found' });
  const lines = await all(
    `SELECT il.*, s.code as service_code, s.name as service_name FROM invoice_lines il
     LEFT JOIN services s ON s.service_id = il.service_id
     WHERE il.invoice_id = ?`,
    [req.params.id]
  );
  res.json({ ...row, lines });
}

export async function create(req, res) {
  const id = uuid();
  const { customerId, engagementId, issueDate, dueDate, lines, notes, taxRate = 8 } = req.body;
  let total = 0;
  for (const line of lines || []) {
    total += (line.qty || 1) * (line.unitPrice || 0);
  }
  const taxAmount = total * (taxRate / 100);
  const totalAmount = total + taxAmount;

  await run(
    `INSERT INTO invoices (invoice_id, tenant_id, customer_id, engagement_id, issue_date, due_date, total_amount, tax_amount, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
    [id, req.user.tenantId, customerId, engagementId || null, issueDate, dueDate, totalAmount, taxAmount, notes || null]
  );

  for (const line of lines || []) {
    const lineId = uuid();
    const lineTotal = (line.qty || 1) * (line.unitPrice || 0);
    await run(
      `INSERT INTO invoice_lines (invoice_line_id, invoice_id, service_id, description, qty, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lineId, id, line.serviceId || null, line.description, line.qty || 1, line.unitPrice || 0, lineTotal]
    );
  }

  await logAudit(req, 'CREATE', 'invoices', id, null, { totalAmount });
  const invoice = await get('SELECT * FROM invoices WHERE invoice_id = ?', [id]);
  res.status(201).json(invoice);
}

export async function approve(req, res) {
  const invoice = await get('SELECT * FROM invoices WHERE invoice_id = ? AND tenant_id = ?', [
    req.params.id,
    req.user.tenantId,
  ]);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status !== 'draft') return res.status(400).json({ error: 'Only draft invoices can be approved' });

  await run('UPDATE invoices SET status = ? WHERE invoice_id = ?', ['approved', req.params.id]);

  const lines = await all('SELECT * FROM invoice_lines WHERE invoice_id = ?', [req.params.id]);
  const arAccount = await get('SELECT account_id FROM chart_of_accounts WHERE tenant_id = ? AND code = ?', [
    req.user.tenantId,
    '1100',
  ]);
  const taxAccount = await get('SELECT account_id FROM chart_of_accounts WHERE tenant_id = ? AND code = ?', [
    req.user.tenantId,
    '2300',
  ]);

  const journalLines = [
    { accountId: arAccount.account_id, debit: invoice.total_amount, credit: 0, customerId: invoice.customer_id },
    { accountId: taxAccount.account_id, debit: 0, credit: invoice.tax_amount },
  ];

  for (const line of lines) {
    if (line.service_id) {
      const svc = await get('SELECT revenue_account_id FROM services WHERE service_id = ?', [line.service_id]);
      if (svc?.revenue_account_id) {
        journalLines.push({
          accountId: svc.revenue_account_id,
          debit: 0,
          credit: line.line_total,
          serviceId: line.service_id,
          customerId: invoice.customer_id,
        });
      }
    }
  }

  await postJournal(req, {
    description: `AR Invoice ${req.params.id}`,
    sourceModule: 'AR',
    sourceId: req.params.id,
    date: invoice.issue_date,
    lines: journalLines,
  });

  await logAudit(req, 'APPROVE', 'invoices', req.params.id, invoice, { status: 'approved' });
  const updated = await get('SELECT * FROM invoices WHERE invoice_id = ?', [req.params.id]);
  res.json(updated);
}

export async function generateFromEngagement(req, res) {
  const engagement = await get('SELECT * FROM engagements WHERE engagement_id = ? AND tenant_id = ?', [
    req.params.engagementId,
    req.user.tenantId,
  ]);
  if (!engagement) return res.status(404).json({ error: 'Engagement not found' });

  const serviceOrders = await all(
    `SELECT so.*, s.code, s.name FROM service_orders so JOIN services s ON s.service_id = so.service_id
     WHERE so.engagement_id = ?`,
    [req.params.engagementId]
  );

  const lines = serviceOrders.map((so) => ({
    serviceId: so.service_id,
    description: so.description || so.name,
    qty: so.qty,
    unitPrice: so.rate,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  req.body = {
    customerId: engagement.customer_id,
    engagementId: engagement.engagement_id,
    issueDate: today,
    dueDate,
    lines,
    notes: `Auto-generated for ${engagement.title}`,
  };

  return create(req, res);
}
