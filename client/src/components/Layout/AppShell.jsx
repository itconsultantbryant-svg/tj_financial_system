import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ title, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    return () => document.body.classList.remove('nav-open');
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeMenu]);

  useEffect(() => {
    closeMenu();
  }, [title, closeMenu]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <button
        type="button"
        className={`sidebar-overlay${menuOpen ? ' visible' : ''}`}
        aria-label="Close navigation menu"
        onClick={closeMenu}
        tabIndex={menuOpen ? 0 : -1}
      />
      <Sidebar isOpen={menuOpen} onNavigate={closeMenu} />
      <div className="main-area">
        <TopBar title={title} menuOpen={menuOpen} onMenuToggle={toggleMenu} />
        <main id="main-content" className="content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
