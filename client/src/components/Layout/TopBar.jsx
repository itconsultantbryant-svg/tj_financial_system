import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BRAND } from '../../config/branding';

export default function TopBar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-meta">
        <span>{BRAND.country} · {BRAND.currency}</span>
        <span>{user?.fullName}</span>
        <span className="text-muted">{user?.roles?.[0]?.name}</span>
        <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
