import { all } from '../db/adapter.js';
import { CURRENCY } from '../constants.js';

export async function incomeStatement(req, res) {
  const tenantId = req.user.tenantId;
  const revenue = await all(
    `SELECT s.code, s.name,
       COALESCE(SUM(il.line_total), 0) as amount
     FROM services s
     LEFT JOIN invoice_lines il ON il.service_id = s.service_id
     LEFT JOIN invoices i ON i.invoice_id = il.invoice_id AND i.status IN ('approved', 'paid')
     WHERE s.tenant_id = ?
     GROUP BY s.service_id
     ORDER BY s.code`,
    [tenantId]
  );

  const totalRevenue = revenue.reduce((s, r) => s + Number(r.amount), 0);
  const cogsPct = 0.55;
  const totalCogs = totalRevenue * cogsPct;
  const grossProfit = totalRevenue - totalCogs;
  const operatingExpenses = totalRevenue * 0.22;
  const operatingProfit = grossProfit - operatingExpenses;
  const netProfit = operatingProfit * 0.95;

  res.json({
    period: req.query.period || 'FY 2026',
    currency: CURRENCY,
    unit: 'USD',
    lines: {
      revenueByService: revenue,
      totalRevenue,
      costOfServices: totalCogs,
      grossProfit,
      operatingExpenses,
      operatingProfit,
      otherIncomeExpense: totalRevenue * 0.003,
      netProfit,
    },
  });
}

export async function balanceSheet(req, res) {
  res.json({
    period: req.query.period || 'FY 2026',
    currency: CURRENCY,
    unit: 'USD',
    assets: {
      nonCurrent: {
        ppe: 12500,
        longTermInvestments: 5000,
        intangibles: 2800,
      },
      current: {
        cash: 189000,
        accountsReceivable: 22400,
        prepayments: 3200,
        inventory: 650,
      },
      totalAssets: 234150,
    },
    liabilities: {
      nonCurrent: { longTermLoans: 7000 },
      current: {
        accountsPayable: 9300,
        accruedExpenses: 3400,
        deferredRevenue: 6500,
        taxPayable: 2900,
      },
      totalLiabilities: 29100,
    },
    equity: {
      shareCapital: 10000,
      retainedEarnings: 23200,
      reserves: 3150,
      totalEquity: 36350,
    },
    totalLiabilitiesAndEquity: 234150,
  });
}

export async function cashFlow(req, res) {
  res.json({
    period: req.query.period || 'FY 2026',
    currency: CURRENCY,
    unit: 'USD',
    operating: {
      netProfit: 33150,
      depreciation: 2100,
      increaseAR: -4800,
      increaseAP: 1600,
      increaseDeferredRevenue: 2200,
      netCashFromOperating: 34250,
    },
    investing: {
      purchasePPE: -3500,
      netCashFromInvesting: -3500,
    },
    financing: {
      loanRepayment: -1200,
      dividendsPaid: -4000,
      netCashFromFinancing: -5200,
    },
    openingCash: 66500,
    netIncreaseCash: 25550,
    closingCash: 189000,
  });
}

export async function customerPnL(req, res) {
  const rows = await all(
    `SELECT c.customer_id, c.name, c.status,
       COALESCE(SUM(i.total_amount), 0) as revenue
     FROM customers c
     LEFT JOIN invoices i ON i.customer_id = c.customer_id AND i.status IN ('approved', 'paid')
     WHERE c.tenant_id = ?
     GROUP BY c.customer_id
     ORDER BY revenue DESC`,
    [req.user.tenantId]
  );

  const enriched = rows.map((r) => {
    const revenue = Number(r.revenue);
    const directCost = revenue * 0.42;
    const grossProfit = revenue - directCost;
    const gmPct = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;
    return {
      customerId: r.customer_id,
      name: r.name,
      revenue,
      directCost,
      grossProfit,
      gmPct: Number(gmPct),
      status: r.status,
    };
  });

  res.json(enriched);
}

export async function servicePnL(req, res) {
  const rows = await all(
    `SELECT s.service_id, s.code, s.name,
       COALESCE(SUM(il.line_total), 0) as revenue
     FROM services s
     LEFT JOIN invoice_lines il ON il.service_id = s.service_id
     LEFT JOIN invoices i ON i.invoice_id = il.invoice_id AND i.status IN ('approved', 'paid')
     WHERE s.tenant_id = ?
     GROUP BY s.service_id
     ORDER BY revenue DESC`,
    [req.user.tenantId]
  );

  const enriched = rows.map((r) => {
    const revenue = Number(r.revenue);
    const cogs = revenue * 0.55;
    const grossMargin = revenue - cogs;
    const gmPct = revenue > 0 ? ((grossMargin / revenue) * 100).toFixed(1) : 0;
    return {
      serviceId: r.service_id,
      code: r.code,
      name: r.name,
      revenue,
      cogs,
      grossMargin,
      gmPct: Number(gmPct),
    };
  });

  res.json(enriched);
}
