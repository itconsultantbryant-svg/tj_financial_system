import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency, formatNumber } from '../config/branding';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <AppShell title="KPI Dashboard">
        <div className="alert alert-error">{error}</div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="KPI Dashboard">
        <p>Loading dashboard...</p>
      </AppShell>
    );
  }

  const { kpis, revenueByService, arAging, customerPnL, retainerBalances } = data;

  return (
    <AppShell title="KPI Dashboard">
      <div className="page-header">
        <h2>Executive KPI Dashboard</h2>
        <p>Real-time financial visibility across services, customers, and bank accounts</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">{formatCurrency(kpis.totalRevenue)}</div>
          <div className="kpi-sub">Monthly cadence</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Gross Margin</div>
          <div className="kpi-value">{kpis.grossMarginPct}%</div>
          <div className="kpi-sub">Target ≥ 45%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">DSO</div>
          <div className="kpi-value">{kpis.dso} days</div>
          <div className="kpi-sub">Target ≤ 45 days</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cash Position</div>
          <div className="kpi-value">{formatCurrency(kpis.cashPosition)}</div>
          <div className="kpi-sub">Bank reconciliation {kpis.bankReconciliationPct}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Net Margin</div>
          <div className="kpi-value">{kpis.netMarginPct}%</div>
          <div className="kpi-sub">Target ≥ 20%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open Engagements</div>
          <div className="kpi-value">{kpis.openEngagements}</div>
          <div className="kpi-sub">{kpis.draftInvoices} draft invoices</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Revenue by Service Code</h3>
          <table className="data-table" id="revenue-by-service-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueByService.map((row) => (
                <tr key={row.code}>
                  <td><span className="badge badge-info">{row.code}</span></td>
                  <td>{row.name}</td>
                  <td className="text-right">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title">AR Aging Buckets</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bucket</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0–30 days</td><td className="text-right">{formatCurrency(arAging.bucket_0_30)}</td></tr>
              <tr><td>31–60 days</td><td className="text-right">{formatCurrency(arAging.bucket_31_60)}</td></tr>
              <tr><td>61–90 days</td><td className="text-right">{formatCurrency(arAging.bucket_61_90)}</td></tr>
              <tr><td>90+ days</td><td className="text-right">{formatCurrency(arAging.bucket_90_plus)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Customer P&amp;L Snapshot</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {customerPnL.map((c) => (
                <tr key={c.customer_id}>
                  <td>{c.name}</td>
                  <td className="text-right">{formatCurrency(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title">Retainer Balance Tiles (SD-012)</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Engagement</th>
                <th>Customer</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {retainerBalances.map((r) => (
                <tr key={r.engagement_id}>
                  <td>{r.title}</td>
                  <td>{r.customer_name}</td>
                  <td className="text-right">{formatCurrency(r.retainer_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
