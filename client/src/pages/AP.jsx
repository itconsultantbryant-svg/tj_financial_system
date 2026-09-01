import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function APPage() {
  const [bills, setBills] = useState([]);

  const load = () => api('/bills').then(setBills);

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api(`/bills/${id}/approve`, { method: 'POST', body: '{}' });
    load();
  };

  return (
    <AppShell title="Accounts Payable">
      <div className="page-header">
        <h2>Accounts Payable</h2>
        <p>Vendor bills, WHT, payment runs, and subcontractor payables</p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Vendor</th>
              <th>Due Date</th>
              <th className="text-right">Amount</th>
              <th className="text-right">WHT</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.bill_id}>
                <td>{b.bill_id.slice(0, 8)}…</td>
                <td>{b.vendor_name}</td>
                <td>{b.due_date}</td>
                <td className="text-right">{formatCurrency(b.amount)}</td>
                <td className="text-right">{formatCurrency(b.wht)}</td>
                <td><span className="badge badge-warning">{b.status}</span></td>
                <td>
                  {b.status === 'pending' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => approve(b.bill_id)}>
                      Approve
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
