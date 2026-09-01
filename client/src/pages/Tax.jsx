import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function TaxPage() {
  const [codes, setCodes] = useState([]);
  const [schedules, setSchedules] = useState(null);

  useEffect(() => {
    api('/tax/codes').then(setCodes);
    api('/tax/schedules').then(setSchedules);
  }, []);

  return (
    <AppShell title="Tax Management">
      <div className="page-header">
        <h2>Tax Management</h2>
        <p>Sales tax, withholding, and payroll tax schedules (USD)</p>
      </div>
      {schedules && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Sales Tax Collected</div>
            <div className="kpi-value">{formatCurrency(schedules.salesTax.collected)}</div>
            <div className="kpi-sub">Rate {schedules.salesTax.rate}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">WHT Withheld</div>
            <div className="kpi-value">{formatCurrency(schedules.withholding.withheld)}</div>
            <div className="kpi-sub">Rate {schedules.withholding.rate}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Payroll Tax (PAYE)</div>
            <div className="kpi-value">{formatCurrency(schedules.payrollTax.paye)}</div>
            <div className="kpi-sub">Currency: {schedules.currency}</div>
          </div>
        </div>
      )}
      <div className="card">
        <h3 className="card-title">Tax Codes</h3>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Type</th><th>Rate %</th><th>GL Account</th></tr></thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.tax_code_id}><td>{c.code}</td><td>{c.type}</td><td>{c.rate}%</td><td>{c.gl_code} – {c.gl_name}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
