import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', creditLimit: 0 });
  const [showForm, setShowForm] = useState(false);

  const load = () => api('/customers').then(setCustomers);

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api('/customers', { method: 'POST', body: JSON.stringify(form) });
    setForm({ name: '', email: '', phone: '', creditLimit: 0 });
    setShowForm(false);
    load();
  };

  return (
    <AppShell title="Customers">
      <div className="page-header">
        <h2>Customer Master</h2>
        <p>Client statements, retainer ledgers, and P&amp;L drill-down</p>
      </div>

      <button type="button" className="btn btn-primary mb-1" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New Customer'}
      </button>

      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Credit Limit</label>
              <input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">Save Customer</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="data-table" id="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>KYC</th>
              <th>Portal</th>
              <th className="text-right">Credit Limit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td><span className={`badge ${c.kyc_status === 'verified' ? 'badge-success' : 'badge-warning'}`}>{c.kyc_status}</span></td>
                <td>{c.portal_access ? 'Yes' : 'No'}</td>
                <td className="text-right">{formatCurrency(c.credit_limit)}</td>
                <td><span className="badge badge-success">{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
