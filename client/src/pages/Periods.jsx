import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PeriodsPage() {
  const [periods, setPeriods] = useState([]);

  const load = () => api('/periods').then(setPeriods);

  useEffect(() => { load(); }, []);

  const closePeriod = async (id) => {
    await api(`/periods/${id}/close`, { method: 'POST', body: '{}' });
    load();
  };

  const reopenPeriod = async (id) => {
    await api(`/periods/${id}/reopen`, { method: 'POST', body: '{}' });
    load();
  };

  return (
    <AppShell title="Period Close">
      <div className="page-header">
        <h2>Period Close Workflow</h2>
        <p>Lock fiscal periods after trial balance review and sign-off</p>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Period</th><th>Year</th><th>Month</th><th>Status</th><th>Locked By</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.period_id}>
                <td>{p.period_id}</td>
                <td>{p.year}</td>
                <td>{MONTHS[p.month - 1]}</td>
                <td>
                  <span className={`badge ${p.status === 'locked' ? 'badge-danger' : p.status === 'open' ? 'badge-success' : 'badge-muted'}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.locked_by || '—'}</td>
                <td>
                  {p.status === 'open' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => closePeriod(p.period_id)}>Close &amp; Lock</button>
                  )}
                  {p.status === 'locked' && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => reopenPeriod(p.period_id)}>Reopen</button>
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
