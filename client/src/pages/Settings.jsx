import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { BRAND } from '../config/branding';

export default function SettingsPage() {
  const { tenant } = useAuth();
  const [settings, setSettings] = useState(null);
  const [coa, setCoa] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tagline: '', primaryColor: '', secondaryColor: '' });

  useEffect(() => {
    api('/settings/tenant').then((data) => {
      setSettings(data);
      setForm({
        tagline: data.tagline || '',
        primaryColor: data.primaryColor || BRAND.primaryColor,
        secondaryColor: data.secondaryColor || BRAND.secondaryColor,
      });
    });
    api('/chart-of-accounts').then(setCoa);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api('/settings/tenant', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setSettings(data);
    } finally {
      setSaving(false);
    }
  };

  const display = settings || tenant || BRAND;

  return (
    <AppShell title="Tenant Settings">
      <div className="page-header">
        <h2>System Settings</h2>
        <p>TJ Consultancy Inc. — Monrovia, Liberia · USD reporting currency</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Company &amp; Locale</h3>
          <div className="settings-logo-wrap">
            <img src={display.logoUrl || BRAND.logoUrl} alt={`${display.name || BRAND.name} logo`} />
          </div>
          <table className="data-table">
            <tbody>
              <tr><td>Company</td><td>{display.name || BRAND.name}</td></tr>
              <tr><td>Country</td><td>{display.country || BRAND.country}</td></tr>
              <tr><td>Country Code</td><td>{display.countryCode || BRAND.countryCode}</td></tr>
              <tr><td>Timezone</td><td>{display.timezone || BRAND.timezone}</td></tr>
              <tr>
                <td>Currency</td>
                <td>
                  <span className="badge badge-success">USD</span>
                  <span className="text-muted ml-1">Locked — Liberia operations use USD</span>
                </td>
              </tr>
              <tr><td>Locale</td><td>{display.locale || BRAND.locale}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title">Branding (editable)</h3>
          <form onSubmit={handleSave}>
            <div className="form-group mb-1">
              <label>Tagline</label>
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>
            <div className="form-group mb-1">
              <label>Primary Color</label>
              <input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
            </div>
            <div className="form-group mb-1">
              <label>Secondary Color</label>
              <input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </form>
          <ul className="settings-list text-muted">
            <li>Fiscal year: January–December</li>
            <li>All financial amounts displayed in US Dollars (USD)</li>
            <li>No NGN or other currencies — USD only</li>
            <li>Registered and operating in Liberia</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Chart of Accounts ({coa.length} accounts)</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {coa.map((a) => (
              <tr key={a.account_id}>
                <td>{a.code}</td>
                <td>{a.name}</td>
                <td><span className="badge badge-muted">{a.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
