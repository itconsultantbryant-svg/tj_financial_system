import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BRAND } from '../../config/branding';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    links: [{ to: '/', label: 'KPI Dashboard', end: true }],
  },
  {
    title: 'CRM & Engagement',
    links: [
      { to: '/leads', label: 'Leads & CRM' },
      { to: '/customers', label: 'Customers' },
      { to: '/engagements', label: 'Engagements' },
      { to: '/timesheets', label: 'Timesheets' },
      { to: '/services', label: 'Service Catalog' },
    ],
  },
  {
    title: 'Financial Modules',
    links: [
      { to: '/gl', label: 'General Ledger' },
      { to: '/ar', label: 'Accounts Receivable' },
      { to: '/ap', label: 'Accounts Payable' },
      { to: '/payments', label: 'Collections' },
      { to: '/expenses', label: 'Expense Claims' },
      { to: '/payroll', label: 'Payroll' },
      { to: '/assets', label: 'Fixed Assets' },
      { to: '/tax', label: 'Tax Management' },
      { to: '/banking', label: 'Banking & Cash' },
      { to: '/reports', label: 'Financial Reports' },
      { to: '/periods', label: 'Period Close' },
    ],
  },
  {
    title: 'Portal & Compliance',
    links: [
      { to: '/portal', label: 'Customer Portal' },
      { to: '/audit', label: 'Audit Trail' },
      { to: '/settings', label: 'Tenant Settings' },
    ],
  },
];

export default function Sidebar() {
  const { tenant, user } = useAuth();
  const logo = tenant?.logoUrl || BRAND.logoUrl;
  const name = tenant?.name || BRAND.name;
  const isPortalOnly = user?.roles?.length === 1 && user.roles[0].name === 'Customer Portal User';

  const sections = isPortalOnly
    ? [{ title: 'Portal', links: [{ to: '/portal', label: 'My Account' }] }]
    : NAV_SECTIONS;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt={name} />
        <h1>{name}</h1>
        <p>{tenant?.tagline || BRAND.tagline}</p>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="nav-section">
            <p className="nav-section-title">{section.title}</p>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
