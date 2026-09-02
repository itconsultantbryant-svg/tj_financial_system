import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BRAND } from '../../config/branding';

export default function TopBar({ title, menuOpen, onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button
          type="button"
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-expanded={menuOpen}
          aria-controls="main-content"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className="menu-toggle-bar" aria-hidden="true" />
          <span className="menu-toggle-bar" aria-hidden="true" />
          <span className="menu-toggle-bar" aria-hidden="true" />
        </button>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-meta">
        <span className="topbar-meta-item topbar-locale" aria-label={`Region and currency: ${BRAND.country}, ${BRAND.currency}`}>
          {BRAND.country} · {BRAND.currency}
        </span>
        <span className="topbar-meta-item topbar-user" aria-label={`Signed in as ${user?.fullName}`}>
          {user?.fullName}
        </span>
        <span className="topbar-meta-item topbar-role text-muted">{user?.roles?.[0]?.name}</span>
        <button type="button" className="btn btn-outline btn-sm topbar-signout" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
