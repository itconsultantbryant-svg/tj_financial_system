import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api('/services').then(setServices);
  }, []);

  return (
    <AppShell title="Service Catalog">
      <div className="page-header">
        <h2>Service Taxonomy &amp; Chart of Accounts Mapping</h2>
        <p>19 service codes with revenue, COGS, tax, and pricing basis defaults</p>
      </div>

      <div className="card">
        <table className="data-table" id="services-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Service</th>
              <th>Revenue Account</th>
              <th>COGS Account</th>
              <th>Pricing Basis</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.service_id}>
                <td><span className="badge badge-info">{s.code}</span></td>
                <td>{s.name}</td>
                <td>{s.revenue_code} – {s.revenue_name}</td>
                <td>{s.cogs_code} – {s.cogs_name}</td>
                <td>{s.pricing_basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
