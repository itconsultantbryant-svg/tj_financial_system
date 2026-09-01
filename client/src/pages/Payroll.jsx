import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function PayrollPage() {
  const [runs, setRuns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ period: '', totalGross: 0, paye: 0, pension: 0, netPay: 0 });

  const load = () => api('/payroll').then(setRuns);

  useEffect(() => {
    load();
    api('/employees').then(setEmployees);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api('/payroll', {
      method: 'POST',
      body: JSON.stringify({
        period: form.period,
        totalGross: Number(form.totalGross),
        paye: Number(form.paye),
        pension: Number(form.pension),
        netPay: Number(form.netPay),
      }),
    });
    load();
  };

  const postRun = async (id) => {
    await api(`/payroll/${id}/post`, { method: 'POST', body: '{}' });
    load();
  };

  return (
    <AppShell title="Payroll">
      <div className="page-header">
        <h2>Payroll &amp; HR Costs</h2>
        <p>Payroll register — USD salaries and withholdings</p>
      </div>
      <div className="card">
        <h3 className="card-title">Employees</h3>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Position</th><th className="text-right">Annual Salary (USD)</th></tr></thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.employee_id}><td>{e.name}</td><td>{e.position}</td><td className="text-right">{formatCurrency(e.salary)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3 className="card-title">New Payroll Run</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group"><label>Period</label><input placeholder="2026-08" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} required /></div>
          <div className="form-group"><label>Total Gross (USD)</label><input type="number" value={form.totalGross} onChange={(e) => setForm({ ...form, totalGross: e.target.value })} /></div>
          <div className="form-group"><label>PAYE (USD)</label><input type="number" value={form.paye} onChange={(e) => setForm({ ...form, paye: e.target.value })} /></div>
          <div className="form-group"><label>Pension (USD)</label><input type="number" value={form.pension} onChange={(e) => setForm({ ...form, pension: e.target.value })} /></div>
          <div className="form-group"><label>Net Pay (USD)</label><input type="number" value={form.netPay} onChange={(e) => setForm({ ...form, netPay: e.target.value })} /></div>
          <div><button type="submit" className="btn btn-primary">Create Run</button></div>
        </form>
      </div>
      <div className="card">
        <h3 className="card-title">Payroll Runs</h3>
        <table className="data-table">
          <thead>
            <tr><th>Period</th><th className="text-right">Gross</th><th className="text-right">PAYE</th><th className="text-right">Net Pay</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.payroll_run_id}>
                <td>{r.period}</td>
                <td className="text-right">{formatCurrency(r.total_gross)}</td>
                <td className="text-right">{formatCurrency(r.paye)}</td>
                <td className="text-right">{formatCurrency(r.net_pay)}</td>
                <td><span className="badge badge-info">{r.status}</span></td>
                <td>
                  {r.status === 'draft' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => postRun(r.payroll_run_id)}>Post</button>
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
