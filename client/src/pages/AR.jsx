import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

function statusBadge(status) {
  const map = {
    draft: 'badge-warning',
    approved: 'badge-info',
    paid: 'badge-success',
    sent: 'badge-info',
  };
  return map[status] || 'badge-muted';
}

export default function ARPage() {
  const [invoices, setInvoices] = useState([]);

  const load = () => api('/invoices').then(setInvoices);

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api(`/invoices/${id}/approve`, { method: 'POST', body: '{}' });
    load();
  };

  return (
    <AppShell title="Accounts Receivable">
      <div className="page-header">
        <h2>Accounts Receivable</h2>
        <p>Invoices, aging, retainer draw-downs, and customer statements</p>
      </div>

      <div className="card">
        <table className="data-table" id="invoices-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th className="text-right">Total</th>
              <th className="text-right">Tax</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.invoice_id}>
                <td>{inv.invoice_id.slice(0, 8)}…</td>
                <td>{inv.customer_name}</td>
                <td>{inv.issue_date}</td>
                <td>{inv.due_date}</td>
                <td className="text-right">{formatCurrency(inv.total_amount)}</td>
                <td className="text-right">{formatCurrency(inv.tax_amount)}</td>
                <td><span className={`badge ${statusBadge(inv.status)}`}>{inv.status}</span></td>
                <td>
                  {inv.status === 'draft' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => approve(inv.invoice_id)}>
                      Approve &amp; Post
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
