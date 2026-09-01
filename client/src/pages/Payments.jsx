import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';
import { formatCurrency } from '../config/branding';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ customerId: '', invoiceId: '', bankAccountId: '', amount: 0, date: '', method: 'ACH', reference: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => api('/payments').then(setPayments);

  useEffect(() => {
    load();
    api('/customers').then(setCustomers);
    api('/invoices?status=approved').then(setInvoices);
    api('/banking/accounts').then(setAccounts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api('/payments', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
    setShowForm(false);
    load();
  };

  return (
    <AppShell title="Collections">
      <div className="page-header">
        <h2>Collections &amp; Receipts</h2>
        <p>Match receipts to invoices — all amounts in USD</p>
      </div>
      <button type="button" className="btn btn-primary mb-1" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Record Payment'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Customer</label>
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                <option value="">Select</option>
                {customers.map((c) => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Invoice (optional)</label>
              <select value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}>
                <option value="">None</option>
                {invoices.map((i) => <option key={i.invoice_id} value={i.invoice_id}>{i.invoice_id.slice(0, 8)} — {formatCurrency(i.total_amount)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bank Account</label>
              <select value={form.bankAccountId} onChange={(e) => setForm({ ...form, bankAccountId: e.target.value })}>
                <option value="">None</option>
                {accounts.map((a) => <option key={a.bank_account_id} value={a.bank_account_id}>{a.bank_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (USD)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Method</label>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="ACH">ACH</option>
                <option value="Wire">Wire</option>
                <option value="Check">Check</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div><button type="submit" className="btn btn-primary">Record Payment</button></div>
          </form>
        </div>
      )}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Customer</th><th className="text-right">Amount (USD)</th><th>Method</th><th>Reference</th></tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.payment_id}>
                <td>{p.date}</td>
                <td>{p.customer_name}</td>
                <td className="text-right">{formatCurrency(p.amount)}</td>
                <td>{p.method}</td>
                <td>{p.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
