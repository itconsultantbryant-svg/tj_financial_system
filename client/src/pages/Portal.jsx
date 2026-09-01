import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function PortalPage() {
  const [data, setData] = useState(null);
  const [statement, setStatement] = useState(null);

  useEffect(() => {
    api('/portal/dashboard').then(setData).catch(() => setData(null));
    api('/portal/statement').then(setStatement).catch(() => setStatement(null));
  }, []);

  if (!data) {
    return (
      <AppShell title="Customer Portal">
        <div className="alert alert-error">Portal access requires a customer-linked account (e.g. accounts@banka.com)</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Customer Portal">
      <div className="page-header">
        <h2>Customer Self-Service Portal</h2>
        <p>{data.customer.name} — balances and statements in USD</p>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Open Balance</div>
          <div className="kpi-value">{formatCurrency(data.openBalance)}</div>
          <div className="kpi-sub">{data.currency}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Invoices</div>
          <div className="kpi-value">{data.invoices.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Payments</div>
          <div className="kpi-value">{data.payments.length}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Invoices</h3>
          <table className="data-table">
            <thead><tr><th>Issue</th><th>Due</th><th className="text-right">Total (USD)</th><th>Status</th></tr></thead>
            <tbody>
              {data.invoices.map((i) => (
                <tr key={i.invoice_id}>
                  <td>{i.issue_date}</td>
                  <td>{i.due_date}</td>
                  <td className="text-right">{formatCurrency(i.total_amount)}</td>
                  <td><span className="badge badge-info">{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 className="card-title">Payments</h3>
          <table className="data-table">
            <thead><tr><th>Date</th><th className="text-right">Amount</th><th>Method</th></tr></thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.payment_id}>
                  <td>{p.date}</td>
                  <td className="text-right">{formatCurrency(p.amount)}</td>
                  <td>{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {statement && (
        <div className="card">
          <h3 className="card-title">Statement of Account — {statement.customerName}</h3>
          <p className="text-muted">Generated {statement.generatedAt} · {statement.currency}</p>
        </div>
      )}
    </AppShell>
  );
}
