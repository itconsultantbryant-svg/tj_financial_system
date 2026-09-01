import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ title, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar title={title} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
