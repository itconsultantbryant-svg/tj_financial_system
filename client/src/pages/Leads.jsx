import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'web', score: 50 });
  const [showForm, setShowForm] = useState(false);

  const load = () => api('/leads').then(setLeads);

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api('/leads', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    load();
  };

  return (
    <AppShell title="Leads & CRM">
      <div className="page-header">
        <h2>Leads &amp; CRM</h2>
        <p>Lead capture, qualification, and quotation pipeline</p>
      </div>
      <button type="button" className="btn btn-primary mb-1" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ New Lead'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label>Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
            <div className="form-group"><label>Score</label><input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
            <div><button type="submit" className="btn btn-primary">Save Lead</button></div>
          </form>
        </div>
      )}
      <div className="card">
        <table className="data-table" id="leads-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Source</th><th>Score</th><th>Status</th></tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.lead_id}>
                <td>{l.name}</td>
                <td>{l.email}</td>
                <td>{l.source}</td>
                <td>{l.score}</td>
                <td><span className="badge badge-muted">{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
