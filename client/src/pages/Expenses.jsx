import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function ExpensesPage() {
  const [claims, setClaims] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employeeId: '', amount: 0, description: '', date: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => api('/expenses').then(setClaims);

  useEffect(() => {
    load();
    api('/employees').then(setEmployees);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api('/expenses', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
    setShowForm(false);
    load();
  };

  const approve = async (id) => {
    await api(`/expenses/${id}/approve`, { method: 'POST', body: '{}' });
    load();
  };

  return (
    <AppShell title="Expenses">
      <div className="page-header">
        <h2>Expense Claims</h2>
        <p>Approval workflow — USD amounts only</p>
      </div>
      <button type="button" className="btn btn-primary mb-1" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New Claim'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Employee</label>
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Select</option>
                {employees.map((e) => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (USD)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div><button type="submit" className="btn btn-primary">Submit Claim</button></div>
          </form>
        </div>
      )}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Employee</th><th>Service</th><th className="text-right">Amount</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.claim_id}>
                <td>{c.date}</td>
                <td>{c.employee_name || '—'}</td>
                <td>{c.service_code || '—'}</td>
                <td className="text-right">{formatCurrency(c.amount)}</td>
                <td><span className="badge badge-warning">{c.status}</span></td>
                <td>
                  {c.status === 'pending' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => approve(c.claim_id)}>Approve</button>
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
