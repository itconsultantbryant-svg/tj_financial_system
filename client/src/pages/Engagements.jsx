import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customerId: '', type: 'Retainer', title: '', startDate: '', monthlyFee: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api('/engagements').then(setEngagements);
    api('/customers').then(setCustomers);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api('/engagements', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    api('/engagements').then(setEngagements);
  };

  const generateInvoice = async (engagementId) => {
    await api(`/engagements/${engagementId}/generate-invoice`, { method: 'POST', body: '{}' });
    alert('Draft invoice generated. Review in Accounts Receivable.');
  };

  return (
    <AppShell title="Engagements">
      <div className="page-header">
        <h2>Engagements &amp; Service Orders</h2>
        <p>Retainer (SD-012) and Project-Specific (SD-013) mandate workflows</p>
      </div>

      <button type="button" className="btn btn-primary mb-1" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New Engagement'}
      </button>

      {showForm && (
        <div className="card">
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-group">
              <label>Customer</label>
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Retainer">Retainer Mandate (SD-012)</option>
                <option value="Project">Project-Specific (SD-013)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Monthly Fee / Value</label>
              <input type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">Create Engagement</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Start</th>
              <th className="text-right">Retainer Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {engagements.map((e) => (
              <tr key={e.engagement_id}>
                <td>{e.title}</td>
                <td>{e.customer_name}</td>
                <td><span className="badge badge-info">{e.type}</span></td>
                <td>{e.start_date}</td>
                <td className="text-right">{formatCurrency(e.retainer_balance)}</td>
                <td><span className="badge badge-success">{e.status}</span></td>
                <td>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => generateInvoice(e.engagement_id)}>
                    Generate Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
