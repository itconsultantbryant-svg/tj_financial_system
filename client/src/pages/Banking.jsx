import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function BankingPage() {
  const [accounts, setAccounts] = useState([]);
  const [reconciliation, setReconciliation] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api('/banking/accounts').then(setAccounts);
    api('/banking/reconciliation').then(setReconciliation);
    api('/banking/transactions').then(setTransactions);
  }, []);

  return (
    <AppShell title="Banking & Cash">
      <div className="page-header">
        <h2>Banking &amp; Cash Management</h2>
        <p>Bank reconciliation and cash position — USD only</p>
      </div>

      <div className="card mb-1">
        <h3 className="card-title">Import Bank Transactions (CSV rows)</h3>
        <p className="text-muted">Paste JSON array: [{`{"date":"2026-08-01","amount":500,"description":"Deposit"}`}]</p>
        <div className="form-group mb-1">
          <label htmlFor="import-json">Transaction JSON</label>
          <textarea
            id="import-json"
            rows={3}
            placeholder='[{"date":"2026-08-01","amount":500,"description":"Wire in"}]'
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={async () => {
            const raw = document.getElementById('import-json').value;
            const transactions = JSON.parse(raw);
            const bankAccountId = accounts[0]?.bank_account_id;
            if (!bankAccountId) return;
            await api('/banking/import', {
              method: 'POST',
              body: JSON.stringify({ bankAccountId, transactions }),
            });
            api('/banking/transactions').then(setTransactions);
            api('/banking/reconciliation').then(setReconciliation);
          }}
        >
          Import to {accounts[0]?.bank_name || 'primary account'}
        </button>
      </div>

      <div className="kpi-grid">
        {accounts.map((acc) => (
          <div key={acc.bank_account_id} className="kpi-card">
            <div className="kpi-label">{acc.bank_name}</div>
            <div className="kpi-value">{formatCurrency(acc.balance)}</div>
            <div className="kpi-sub">{acc.account_no} · {acc.currency}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">Reconciliation Status</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Account</th>
              <th className="text-right">Balance</th>
              <th className="text-right">Matched</th>
              <th className="text-right">Unmatched</th>
              <th className="text-right">Match %</th>
            </tr>
          </thead>
          <tbody>
            {reconciliation.map((r) => (
              <tr key={r.bankAccountId}>
                <td>{r.bankName} ({r.accountNo})</td>
                <td className="text-right">{formatCurrency(r.balance)}</td>
                <td className="text-right">{r.matched}</td>
                <td className="text-right">{r.unmatched}</td>
                <td className="text-right">{r.matchPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="card-title">Bank Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-muted">No transactions imported. Import CSV / MT940 or connect Open Banking API.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.txn_id}>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td className="text-right">{formatCurrency(t.amount)}</td>
                  <td><span className="badge badge-muted">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
