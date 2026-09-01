import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function GLPage() {
  const [trialBalance, setTrialBalance] = useState(null);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    api('/journals/trial-balance').then(setTrialBalance);
    api('/journals').then(setJournals);
  }, []);

  return (
    <AppShell title="General Ledger">
      <div className="page-header">
        <h2>General Ledger</h2>
        <p>Double-entry ledger with debit = credit enforcement and audit trail</p>
      </div>

      {trialBalance && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Debits</div>
            <div className="kpi-value">{formatCurrency(trialBalance.totalDebit)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total Credits</div>
            <div className="kpi-value">{formatCurrency(trialBalance.totalCredit)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Balanced</div>
            <div className="kpi-value">{trialBalance.balanced ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Trial Balance</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th>Type</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(trialBalance?.rows || []).filter((r) => Number(r.total_debit) || Number(r.total_credit)).map((row) => (
              <tr key={row.code}>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td className="text-right">{formatCurrency(row.total_debit)}</td>
                <td className="text-right">{formatCurrency(row.total_credit)}</td>
                <td className="text-right">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="card-title">Recent Journal Entries</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Module</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j) => (
              <tr key={j.journal_id}>
                <td>{j.date}</td>
                <td>{j.description}</td>
                <td>{j.source_module}</td>
                <td><span className="badge badge-success">{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
