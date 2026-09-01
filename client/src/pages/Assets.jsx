import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [form, setForm] = useState({ name: '', cost: 0, acqDate: '', usefulLifeYears: 5 });

  useEffect(() => {
    api('/assets').then(setAssets);
    api('/assets/depreciation-schedule').then(setSchedule);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api('/assets', {
      method: 'POST',
      body: JSON.stringify({ ...form, cost: Number(form.cost), usefulLifeYears: Number(form.usefulLifeYears) }),
    });
    api('/assets').then(setAssets);
    api('/assets/depreciation-schedule').then(setSchedule);
  };

  return (
    <AppShell title="Fixed Assets">
      <div className="page-header">
        <h2>Fixed Assets &amp; Depreciation</h2>
        <p>Asset register and depreciation schedule (USD)</p>
      </div>
      <div className="card">
        <h3 className="card-title">Add Asset</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Cost (USD)</label><input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required /></div>
          <div className="form-group"><label>Acquisition Date</label><input type="date" value={form.acqDate} onChange={(e) => setForm({ ...form, acqDate: e.target.value })} required /></div>
          <div className="form-group"><label>Useful Life (years)</label><input type="number" value={form.usefulLifeYears} onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })} /></div>
          <div><button type="submit" className="btn btn-primary">Capitalize Asset</button></div>
        </form>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Asset Register</h3>
          <table className="data-table">
            <thead><tr><th>Asset</th><th className="text-right">Cost</th><th className="text-right">NBV</th><th>Method</th></tr></thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.asset_id}><td>{a.name}</td><td className="text-right">{formatCurrency(a.cost)}</td><td className="text-right">{formatCurrency(a.nbv)}</td><td>{a.depreciation_method}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 className="card-title">Depreciation Schedule</h3>
          <table className="data-table">
            <thead><tr><th>Asset</th><th className="text-right">Annual Dep.</th><th className="text-right">NBV</th></tr></thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.assetId}><td>{s.name}</td><td className="text-right">{formatCurrency(s.annualDepreciation)}</td><td className="text-right">{formatCurrency(s.nbv)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
