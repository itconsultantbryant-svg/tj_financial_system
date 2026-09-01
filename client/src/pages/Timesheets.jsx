import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';

export default function TimesheetsPage() {
  const [rows, setRows] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ serviceOrderId: '', employeeId: '', date: '', hours: 8, description: '', deliverable: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => api('/timesheets').then(setRows);

  useEffect(() => {
    load();
    api('/engagements').then((engagements) => {
      engagements.forEach((e) => api(`/engagements/${e.engagement_id}`).then((d) => {
        setServiceOrders((prev) => [...prev, ...d.serviceOrders || []]);
      }));
    });
    api('/employees').then(setEmployees);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api('/timesheets', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    load();
  };

  return (
    <AppShell title="Timesheets">
      <div className="page-header">
        <h2>Time &amp; Deliverable Log</h2>
        <p>Daily activity capture per service order line (USD billing basis)</p>
      </div>
      <button type="button" className="btn btn-primary mb-1" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Log Time'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Service Order</label>
              <select value={form.serviceOrderId} onChange={(e) => setForm({ ...form, serviceOrderId: e.target.value })} required>
                <option value="">Select</option>
                {serviceOrders.map((so) => (
                  <option key={so.service_order_id} value={so.service_order_id}>{so.description || so.service_order_id}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Employee</label>
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Hours</label>
              <input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deliverable</label>
              <input value={form.deliverable} onChange={(e) => setForm({ ...form, deliverable: e.target.value })} />
            </div>
            <div><button type="submit" className="btn btn-primary">Save</button></div>
          </form>
        </div>
      )}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Employee</th><th>Service</th><th>Hours</th><th>Description</th><th>Deliverable</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.timesheet_id}>
                <td>{r.date}</td>
                <td>{r.employee_name || '—'}</td>
                <td>{r.service_code || '—'}</td>
                <td>{r.hours}</td>
                <td>{r.description}</td>
                <td>{r.deliverable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
