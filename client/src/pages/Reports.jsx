import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function ReportsPage() {
  const [tab, setTab] = useState('income');
  const [income, setIncome] = useState(null);
  const [balance, setBalance] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [customerPnL, setCustomerPnL] = useState([]);
  const [servicePnL, setServicePnL] = useState([]);

  useEffect(() => {
    api('/reports/income-statement').then(setIncome);
    api('/reports/balance-sheet').then(setBalance);
    api('/reports/cash-flow').then(setCashFlow);
    api('/reports/customer-pnl').then(setCustomerPnL);
    api('/reports/service-pnl').then(setServicePnL);
  }, []);

  const tabs = [
    { id: 'income', label: 'Income Statement' },
    { id: 'balance', label: 'Balance Sheet' },
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'customer', label: 'Customer P&L' },
    { id: 'service', label: 'Service P&L' },
  ];

  return (
    <AppShell title="Financial Reports">
      <div className="page-header">
        <h2>Financial Reports</h2>
        <p>IS, BS, CF, per-customer and per-service P&amp;L with drill-down</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'income' && income && (
        <div className="card">
          <h3 className="card-title">Income Statement — {income.period} ({income.currency})</h3>
          <table className="data-table">
            <tbody>
              {income.lines.revenueByService.map((r) => (
                <tr key={r.code}>
                  <td>Revenue – {r.code}</td>
                  <td>{r.name}</td>
                  <td className="text-right">{formatCurrency(r.amount)}</td>
                </tr>
              ))}
              <tr><td colSpan={2}><strong>Total Revenue</strong></td><td className="text-right"><strong>{formatCurrency(income.lines.totalRevenue)}</strong></td></tr>
              <tr><td colSpan={2}>Less: Cost of Services</td><td className="text-right">({formatCurrency(income.lines.costOfServices)})</td></tr>
              <tr><td colSpan={2}><strong>Gross Profit</strong></td><td className="text-right"><strong>{formatCurrency(income.lines.grossProfit)}</strong></td></tr>
              <tr><td colSpan={2}>Operating Expenses</td><td className="text-right">({formatCurrency(income.lines.operatingExpenses)})</td></tr>
              <tr><td colSpan={2}><strong>Operating Profit</strong></td><td className="text-right"><strong>{formatCurrency(income.lines.operatingProfit)}</strong></td></tr>
              <tr><td colSpan={2}><strong>Net Profit</strong></td><td className="text-right"><strong>{formatCurrency(income.lines.netProfit)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === 'balance' && balance && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Assets — {balance.period}</h3>
            <table className="data-table">
              <tbody>
                <tr><td>Property, Plant &amp; Equipment</td><td className="text-right">{formatCurrency(balance.assets.nonCurrent.ppe)}</td></tr>
                <tr><td>Long-term Investments</td><td className="text-right">{formatCurrency(balance.assets.nonCurrent.longTermInvestments)}</td></tr>
                <tr><td>Intangibles</td><td className="text-right">{formatCurrency(balance.assets.nonCurrent.intangibles)}</td></tr>
                <tr><td>Cash &amp; Cash Equivalents</td><td className="text-right">{formatCurrency(balance.assets.current.cash)}</td></tr>
                <tr><td>Accounts Receivable</td><td className="text-right">{formatCurrency(balance.assets.current.accountsReceivable)}</td></tr>
                <tr><td>Prepayments</td><td className="text-right">{formatCurrency(balance.assets.current.prepayments)}</td></tr>
                <tr><td>Inventory</td><td className="text-right">{formatCurrency(balance.assets.current.inventory)}</td></tr>
                <tr><td><strong>Total Assets</strong></td><td className="text-right"><strong>{formatCurrency(balance.assets.totalAssets)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 className="card-title">Liabilities &amp; Equity</h3>
            <table className="data-table">
              <tbody>
                <tr><td>Accounts Payable</td><td className="text-right">{formatCurrency(balance.liabilities.current.accountsPayable)}</td></tr>
                <tr><td>Deferred Revenue</td><td className="text-right">{formatCurrency(balance.liabilities.current.deferredRevenue)}</td></tr>
                <tr><td>Tax Payable</td><td className="text-right">{formatCurrency(balance.liabilities.current.taxPayable)}</td></tr>
                <tr><td>Share Capital</td><td className="text-right">{formatCurrency(balance.equity.shareCapital)}</td></tr>
                <tr><td>Retained Earnings</td><td className="text-right">{formatCurrency(balance.equity.retainedEarnings)}</td></tr>
                <tr><td><strong>Total L + E</strong></td><td className="text-right"><strong>{formatCurrency(balance.totalLiabilitiesAndEquity)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'cashflow' && cashFlow && (
        <div className="card">
          <h3 className="card-title">Cash Flow Statement — {cashFlow.period}</h3>
          <table className="data-table">
            <tbody>
              <tr><td>Net Profit</td><td className="text-right">{formatCurrency(cashFlow.operating.netProfit)}</td></tr>
              <tr><td>Depreciation</td><td className="text-right">{formatCurrency(cashFlow.operating.depreciation)}</td></tr>
              <tr><td>Net Cash from Operating</td><td className="text-right">{formatCurrency(cashFlow.operating.netCashFromOperating)}</td></tr>
              <tr><td>Net Cash from Investing</td><td className="text-right">{formatCurrency(cashFlow.investing.netCashFromInvesting)}</td></tr>
              <tr><td>Net Cash from Financing</td><td className="text-right">{formatCurrency(cashFlow.financing.netCashFromFinancing)}</td></tr>
              <tr><td><strong>Closing Cash</strong></td><td className="text-right"><strong>{formatCurrency(cashFlow.closingCash)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === 'customer' && (
        <div className="card">
          <h3 className="card-title">Profit &amp; Loss per Customer</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Direct Cost</th>
                <th className="text-right">Gross Profit</th>
                <th className="text-right">GM %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customerPnL.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.name}</td>
                  <td className="text-right">{formatCurrency(c.revenue)}</td>
                  <td className="text-right">{formatCurrency(c.directCost)}</td>
                  <td className="text-right">{formatCurrency(c.grossProfit)}</td>
                  <td className="text-right">{c.gmPct}%</td>
                  <td><span className="badge badge-success">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'service' && (
        <div className="card">
          <h3 className="card-title">Service P&amp;L by Code</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">COGS</th>
                <th className="text-right">Gross Margin</th>
                <th className="text-right">GM %</th>
              </tr>
            </thead>
            <tbody>
              {servicePnL.map((s) => (
                <tr key={s.serviceId}>
                  <td><span className="badge badge-info">{s.code}</span></td>
                  <td>{s.name}</td>
                  <td className="text-right">{formatCurrency(s.revenue)}</td>
                  <td className="text-right">{formatCurrency(s.cogs)}</td>
                  <td className="text-right">{formatCurrency(s.grossMargin)}</td>
                  <td className="text-right">{s.gmPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
