import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/Layout/AppShell';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/Customers';
import EngagementsPage from './pages/Engagements';
import ServicesPage from './pages/Services';
import ARPage from './pages/AR';
import APPage from './pages/AP';
import GLPage from './pages/GL';
import BankingPage from './pages/Banking';
import ReportsPage from './pages/Reports';
import AuditPage from './pages/Audit';
import LeadsPage from './pages/Leads';
import SettingsPage from './pages/Settings';
import TimesheetsPage from './pages/Timesheets';
import PaymentsPage from './pages/Payments';
import ExpensesPage from './pages/Expenses';
import PayrollPage from './pages/Payroll';
import AssetsPage from './pages/Assets';
import TaxPage from './pages/Tax';
import PeriodsPage from './pages/Periods';
import PortalPage from './pages/Portal';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page" role="status" aria-live="polite">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PortalRedirect({ children }) {
  const { user } = useAuth();
  const isPortal = user?.roles?.some((r) => r.name === 'Customer Portal User');
  if (isPortal) return <Navigate to="/portal" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/" element={<PortalRedirect><Dashboard /></PortalRedirect>} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/engagements" element={<EngagementsPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/leads" element={<LeadsPage />} />
      <Route path="/timesheets" element={<TimesheetsPage />} />
      <Route path="/gl" element={<GLPage />} />
      <Route path="/ar" element={<ARPage />} />
      <Route path="/ap" element={<APPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/assets" element={<AssetsPage />} />
      <Route path="/tax" element={<TaxPage />} />
      <Route path="/banking" element={<BankingPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/periods" element={<PeriodsPage />} />
      <Route path="/audit" element={<AuditPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
