import { all } from '../db/adapter.js';
import { CURRENCY } from '../constants.js';

export async function listCodes(req, res) {
  const rows = await all(
    `SELECT tc.*, a.code as gl_code, a.name as gl_name
     FROM tax_codes tc
     LEFT JOIN chart_of_accounts a ON a.account_id = tc.gl_account_id
     WHERE tc.tenant_id = ?
     ORDER BY tc.code`,
    [req.user.tenantId]
  );
  res.json(rows);
}

export async function schedules(req, res) {
  const codes = await all('SELECT * FROM tax_codes WHERE tenant_id = ?', [req.user.tenantId]);
  const invoices = await all(
    `SELECT COALESCE(SUM(tax_amount), 0) as total_tax, COALESCE(SUM(total_amount - tax_amount), 0) as net_sales
     FROM invoices WHERE tenant_id = ? AND status IN ('approved', 'paid')`,
    [req.user.tenantId]
  );
  const bills = await all(
    `SELECT COALESCE(SUM(wht), 0) as total_wht, COALESCE(SUM(amount), 0) as total_bills
     FROM bills WHERE tenant_id = ? AND status IN ('approved', 'paid', 'pending')`,
    [req.user.tenantId]
  );
  const payroll = await all(
    `SELECT COALESCE(SUM(paye), 0) as total_paye, COALESCE(SUM(net_pay), 0) as total_net
     FROM payroll_runs WHERE tenant_id = ? AND status = 'posted'`,
    [req.user.tenantId]
  );

  res.json({
    currency: CURRENCY,
    salesTax: {
      rate: codes.find((c) => c.type === 'SALES_TAX')?.rate || 8,
      collected: Number(invoices[0]?.total_tax || 0),
      netSales: Number(invoices[0]?.net_sales || 0),
    },
    withholding: {
      rate: codes.find((c) => c.type === 'WHT')?.rate || 5,
      withheld: Number(bills[0]?.total_wht || 0),
      vendorBills: Number(bills[0]?.total_bills || 0),
    },
    payrollTax: {
      paye: Number(payroll[0]?.total_paye || 0),
      netPayroll: Number(payroll[0]?.total_net || 0),
    },
  });
}
