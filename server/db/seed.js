import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { get, run } from './adapter.js';
import { CURRENCY, COUNTRY, COUNTRY_CODE, LOCALE, TIMEZONE } from '../constants.js';

const TENANT_ID = 'tenant-tj-consultancy';
const TENANT_NAME = 'TJ CONSULTANCY INC.';

function bool(value) {
  return value ? 1 : 0;
}

const ROLES = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    permissions: {
      modules: ['*'],
      create: true,
      edit: true,
      approve: true,
      view: true,
    },
  },
  {
    id: 'role-finance-director',
    name: 'Finance Director',
    permissions: {
      modules: ['gl', 'ar', 'ap', 'banking', 'tax', 'payroll', 'reports', 'period_close', 'audit'],
      create: true,
      edit: true,
      approve: true,
      view: true,
    },
  },
  {
    id: 'role-accountant',
    name: 'Accountant',
    permissions: {
      modules: ['gl', 'ar', 'ap', 'banking', 'journals'],
      create: true,
      edit: true,
      approve: false,
      view: true,
    },
  },
  {
    id: 'role-service-manager',
    name: 'Service Manager',
    permissions: {
      modules: ['engagements', 'service_orders', 'timesheets', 'delivery'],
      create: true,
      edit: true,
      approve: true,
      view: true,
    },
  },
  {
    id: 'role-sales',
    name: 'Sales / CRM Officer',
    permissions: {
      modules: ['leads', 'quotes', 'customers'],
      create: true,
      edit: true,
      approve: true,
      view: true,
    },
  },
  {
    id: 'role-auditor',
    name: 'Auditor',
    permissions: {
      modules: ['gl', 'audit', 'reports'],
      create: false,
      edit: false,
      approve: false,
      view: true,
    },
  },
  {
    id: 'role-customer-portal',
    name: 'Customer Portal User',
    permissions: {
      modules: ['portal'],
      create: false,
      edit: false,
      approve: false,
      view: true,
    },
  },
  {
    id: 'role-network-specialist',
    name: 'Network Specialist / Vendor',
    permissions: {
      modules: ['vendor_portal'],
      create: true,
      edit: true,
      approve: false,
      view: true,
    },
  },
];

const SERVICES = [
  { code: 'FM-001', name: 'Financial Management Advisory Services', rev: '4000-FM', cogs: '5000-FM', basis: 'Hourly / Fixed' },
  { code: 'DD-002', name: 'Business and Financial Due Diligence', rev: '4010-DD', cogs: '5010-DD', basis: 'Project Fixed' },
  { code: 'SD-003', name: 'Systems Designs', rev: '4020-SD', cogs: '5020-SD', basis: 'Project Fixed' },
  { code: 'AF-004', name: 'Accounts Write-up & Financial Statements Analysis', rev: '4030-AF', cogs: '5030-AF', basis: 'Hourly / Retainer' },
  { code: 'RC-005', name: 'Research and Consulting Services', rev: '4040-RC', cogs: '5040-RC', basis: 'Fixed / Hourly' },
  { code: 'MR-006', name: 'Market Research and Market Studies', rev: '4050-MR', cogs: '5050-MR', basis: 'Project Fixed' },
  { code: 'FA-007', name: 'Project Feasibility Analysis & Appraisal', rev: '4060-FA', cogs: '5060-FA', basis: 'Project Fixed' },
  { code: 'BS-008', name: 'Corporate Business Strategy Formulation', rev: '4070-BS', cogs: '5070-BS', basis: 'Project Fixed' },
  { code: 'PR-009', name: 'Policy Research and Analysis', rev: '4080-PR', cogs: '5080-PR', basis: 'Project Fixed' },
  { code: 'HR-010', name: 'Human Resource Reviews & Asset Management', rev: '4090-HR', cogs: '5090-HR', basis: 'Hourly / Fixed' },
  { code: 'PM-011', name: 'Individual & Corporate Portfolio Management', rev: '4100-PM', cogs: '5100-PM', basis: '% of AUM / Fixed' },
  { code: 'SD-012', name: 'Service Delivery Mode – Retainer Mandate', rev: '4110-RET', cogs: '5110-RET', basis: 'Monthly Retainer' },
  { code: 'SD-013', name: 'Service Delivery Mode – Project-Specific Mandate', rev: '4120-PSM', cogs: '5120-PSM', basis: 'Project Fixed' },
  { code: 'VH-014', name: 'Vehicle Hire Services', rev: '4130-VH', cogs: '5130-VH', basis: 'Daily / Trip' },
  { code: 'PS-015', name: 'Printing Services', rev: '4140-PS', cogs: '5140-PS', basis: 'Per Unit / Job' },
  { code: 'NS-016', name: 'Network of Specialists – Engineering', rev: '4150-ENG', cogs: '5150-ENG', basis: '% / Fixed' },
  { code: 'NS-017', name: 'Network of Specialists – ICT', rev: '4160-ICT', cogs: '5160-ICT', basis: '% / Fixed' },
  { code: 'NS-018', name: 'Network of Specialists – Marketing', rev: '4170-MKT', cogs: '5170-MKT', basis: '% / Fixed' },
  { code: 'NS-019', name: 'Network of Specialists – Human Resource Development', rev: '4180-HRD', cogs: '5180-HRD', basis: '% / Fixed' },
];

const COA = [
  { code: '1000', name: 'Cash & Cash Equivalents', type: 'asset' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset' },
  { code: '1200', name: 'Prepayments & Deposits', type: 'asset' },
  { code: '1300', name: 'Inventory', type: 'asset' },
  { code: '1500', name: 'Property, Plant & Equipment', type: 'asset' },
  { code: '1600', name: 'Intangibles', type: 'asset' },
  { code: '1700', name: 'Long-term Investments', type: 'asset' },
  { code: '2000', name: 'Accounts Payable', type: 'liability' },
  { code: '2100', name: 'Accrued Expenses', type: 'liability' },
  { code: '2200', name: 'Deferred Revenue', type: 'liability' },
  { code: '2300', name: 'Tax Payable', type: 'liability' },
  { code: '2400', name: 'Long-term Loans', type: 'liability' },
  { code: '3000', name: 'Share Capital', type: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity' },
  { code: '3200', name: 'Reserves', type: 'equity' },
  { code: '4000-FM', name: 'FM Revenue', type: 'revenue' },
  { code: '4010-DD', name: 'DD Revenue', type: 'revenue' },
  { code: '4020-SD', name: 'SD Revenue', type: 'revenue' },
  { code: '4030-AF', name: 'AF Revenue', type: 'revenue' },
  { code: '4040-RC', name: 'RC Revenue', type: 'revenue' },
  { code: '4050-MR', name: 'MR Revenue', type: 'revenue' },
  { code: '4060-FA', name: 'FA Revenue', type: 'revenue' },
  { code: '4070-BS', name: 'BS Revenue', type: 'revenue' },
  { code: '4080-PR', name: 'PR Revenue', type: 'revenue' },
  { code: '4090-HR', name: 'HR Revenue', type: 'revenue' },
  { code: '4100-PM', name: 'PM Revenue', type: 'revenue' },
  { code: '4110-RET', name: 'RET Revenue', type: 'revenue' },
  { code: '4120-PSM', name: 'PSM Revenue', type: 'revenue' },
  { code: '4130-VH', name: 'VH Revenue', type: 'revenue' },
  { code: '4140-PS', name: 'PS Revenue', type: 'revenue' },
  { code: '4150-ENG', name: 'ENG Revenue', type: 'revenue' },
  { code: '4160-ICT', name: 'ICT Revenue', type: 'revenue' },
  { code: '4170-MKT', name: 'MKT Revenue', type: 'revenue' },
  { code: '4180-HRD', name: 'HRD Revenue', type: 'revenue' },
  { code: '5000-FM', name: 'FM Direct Cost', type: 'expense' },
  { code: '5010-DD', name: 'DD Direct Cost', type: 'expense' },
  { code: '5020-SD', name: 'SD Direct Cost', type: 'expense' },
  { code: '5030-AF', name: 'AF Direct Cost', type: 'expense' },
  { code: '5040-RC', name: 'RC Direct Cost', type: 'expense' },
  { code: '5050-MR', name: 'MR Direct Cost', type: 'expense' },
  { code: '5060-FA', name: 'FA Direct Cost', type: 'expense' },
  { code: '5070-BS', name: 'BS Direct Cost', type: 'expense' },
  { code: '5080-PR', name: 'PR Direct Cost', type: 'expense' },
  { code: '5090-HR', name: 'HR Direct Cost', type: 'expense' },
  { code: '5100-PM', name: 'PM Direct Cost', type: 'expense' },
  { code: '5110-RET', name: 'RET Direct Cost', type: 'expense' },
  { code: '5120-PSM', name: 'PSM Direct Cost', type: 'expense' },
  { code: '5130-VH', name: 'VH Direct Cost', type: 'expense' },
  { code: '5140-PS', name: 'PS Direct Cost', type: 'expense' },
  { code: '5150-ENG', name: 'ENG Subcontractor Cost', type: 'expense' },
  { code: '5160-ICT', name: 'ICT Subcontractor Cost', type: 'expense' },
  { code: '5170-MKT', name: 'MKT Subcontractor Cost', type: 'expense' },
  { code: '5180-HRD', name: 'HRD Subcontractor Cost', type: 'expense' },
  { code: '6000', name: 'Salaries & Wages', type: 'expense' },
  { code: '6100', name: 'Rent & Utilities', type: 'expense' },
  { code: '6200', name: 'Travel', type: 'expense' },
  { code: '6300', name: 'Marketing', type: 'expense' },
  { code: '6400', name: 'Depreciation', type: 'expense' },
  { code: '6500', name: 'Admin', type: 'expense' },
  { code: '7000', name: 'Other Income', type: 'revenue' },
  { code: '7100', name: 'Other Expense', type: 'expense' },
];

async function seed() {
  const existing = await get('SELECT tenant_id FROM tenants WHERE tenant_id = ?', [TENANT_ID]);
  if (existing) {
    console.log('Seed data already exists');
    return;
  }

  await run(
    `INSERT INTO tenants (tenant_id, tenant_name, branding, currency, fiscal_year_start, tagline, primary_color, secondary_color, logo_url)
     VALUES (?, ?, ?, ?, 1, ?, '#1a365d', '#c9a227', '/logo.png')`,
    [
      TENANT_ID,
      TENANT_NAME,
      JSON.stringify({
        company: TENANT_NAME,
        country: COUNTRY,
        countryCode: COUNTRY_CODE,
        locale: LOCALE,
        timezone: TIMEZONE,
        currency: CURRENCY,
      }),
      CURRENCY,
      'Advisory, Strategy & Financial Excellence — Monrovia, Liberia',
    ]
  );

  for (const role of ROLES) {
    await run(
      'INSERT INTO roles (role_id, tenant_id, role_name, permissions) VALUES (?, ?, ?, ?)',
      [role.id, TENANT_ID, role.name, JSON.stringify(role.permissions)]
    );
  }

  const accountMap = {};
  for (const acc of COA) {
    const id = `acc-${acc.code}`;
    accountMap[acc.code] = id;
    await run(
      'INSERT INTO chart_of_accounts (account_id, tenant_id, code, name, type) VALUES (?, ?, ?, ?, ?)',
      [id, TENANT_ID, acc.code, acc.name, acc.type]
    );
  }

  const taxVatId = 'tax-vat';
  const taxWhtId = 'tax-wht';
  await run(
    'INSERT INTO tax_codes (tax_code_id, tenant_id, code, type, rate, gl_account_id) VALUES (?, ?, ?, ?, ?, ?)',
    [taxVatId, TENANT_ID, 'SALES_TAX', 'SALES_TAX', 8, accountMap['2300']]
  );
  await run(
    'INSERT INTO tax_codes (tax_code_id, tenant_id, code, type, rate, gl_account_id) VALUES (?, ?, ?, ?, ?, ?)',
    [taxWhtId, TENANT_ID, 'WHT', 'WHT', 5, accountMap['2300']]
  );

  for (const svc of SERVICES) {
    const id = `svc-${svc.code}`;
    await run(
      `INSERT INTO services (service_id, tenant_id, code, name, revenue_account_id, cogs_account_id, pricing_basis, tax_code_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        TENANT_ID,
        svc.code,
        svc.name,
        accountMap[svc.rev],
        accountMap[svc.cogs],
        svc.basis,
        taxVatId,
      ]
    );
  }

  const hash = await bcrypt.hash('Admin@TJ2026', 10);
  const adminId = 'user-admin';
  await run(
    `INSERT INTO users (user_id, tenant_id, full_name, email, password_hash, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [adminId, TENANT_ID, 'Systems Administrator', 'admin@tjconsultancy.com', hash]
  );
  await run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [adminId, 'role-super-admin']);

  const fdHash = await bcrypt.hash('Finance@TJ2026', 10);
  const fdId = 'user-finance-director';
  await run(
    `INSERT INTO users (user_id, tenant_id, full_name, email, password_hash, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [fdId, TENANT_ID, 'Finance Director', 'finance@tjconsultancy.com', fdHash]
  );
  await run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [fdId, 'role-finance-director']);

  const bankId = 'bank-main';
  await run(
    `INSERT INTO bank_accounts (bank_account_id, tenant_id, bank_name, account_no, currency, type, balance)
     VALUES (?, ?, ?, ?, ?, 'operating', 189000)`,
    [bankId, TENANT_ID, 'Ecobank Liberia', '0123456789', CURRENCY]
  );

  const customers = [
    { id: 'cust-a', name: 'Customer A – Bank (multi-year retainer)', email: 'accounts@banka.com' },
    { id: 'cust-b', name: 'Customer B – Manufacturing Co.', email: 'finance@manufacturing.lr' },
    { id: 'cust-c', name: 'Customer C – Government Agency', email: 'procurement@gov.lr' },
    { id: 'cust-d', name: 'Customer D – Telecom Plc', email: 'billing@telecom.lr' },
    { id: 'cust-e', name: 'Customer E – SME Client', email: 'owner@sme.lr' },
    { id: 'cust-f', name: 'Customer F – Engineering Firm', email: 'admin@engineering.lr' },
  ];

  for (const c of customers) {
    await run(
      `INSERT INTO customers (customer_id, tenant_id, name, email, portal_access, kyc_status, status)
       VALUES (?, ?, ?, ?, ?, 'verified', 'active')`,
      [c.id, TENANT_ID, c.name, c.email, bool(true)]
    );
  }

  const vendors = [
    { id: 'vend-eng', name: 'Engineering Specialist Network', type: 'network_specialist' },
    { id: 'vend-ict', name: 'ICT Specialist Network', type: 'network_specialist' },
    { id: 'vend-print', name: 'Print Solutions Ltd', type: 'vendor' },
    { id: 'vend-vehicle', name: 'Fleet Hire Services', type: 'vendor' },
  ];

  for (const v of vendors) {
    await run(
      `INSERT INTO vendors (vendor_id, tenant_id, name, type, wht_applicable, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [v.id, TENANT_ID, v.name, v.type, bool(true)]
    );
  }

  const engRetainer = 'eng-retainer-a';
  await run(
    `INSERT INTO engagements (engagement_id, tenant_id, customer_id, type, title, start_date, status, monthly_fee, retainer_balance)
     VALUES (?, ?, ?, 'Retainer', 'Multi-year FM Advisory', '2026-01-01', 'active', 12500, 50000)`,
    [engRetainer, TENANT_ID, 'cust-a']
  );

  const engProject = 'eng-project-c';
  await run(
    `INSERT INTO engagements (engagement_id, tenant_id, customer_id, type, title, start_date, status, milestone_schedule)
     VALUES (?, ?, ?, 'Project', 'Due Diligence Project', '2026-03-01', 'active', '{"milestones":[{"pct":30,"label":"Mobilization"},{"pct":40,"label":"Mid-project"},{"pct":30,"label":"Delivery"}]}')`,
    [engProject, TENANT_ID, 'cust-c']
  );

  await run(
    `INSERT INTO service_orders (service_order_id, tenant_id, engagement_id, service_id, qty, rate, amount, status, description)
     VALUES (?, ?, ?, 'svc-FM-001', 1, 12500, 12500, 'open', 'Monthly retainer advisory')`,
    ['so-001', TENANT_ID, engRetainer]
  );

  await run(
    `INSERT INTO service_orders (service_order_id, tenant_id, engagement_id, service_id, qty, rate, amount, status, description)
     VALUES (?, ?, ?, 'svc-DD-002', 1, 210000, 210000, 'open', 'Due diligence scope')`,
    ['so-002', TENANT_ID, engProject]
  );

  for (let m = 1; m <= 12; m++) {
    await run(
      'INSERT INTO fiscal_periods (period_id, tenant_id, year, month, status) VALUES (?, ?, 2026, ?, ?)',
      [`period-2026-${m}`, TENANT_ID, m, m <= 8 ? 'open' : 'future']
    );
  }

  const empConsultant = 'emp-consultant-1';
  const empDirector = 'emp-director-1';
  await run(
    `INSERT INTO employees (employee_id, tenant_id, name, position, salary, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [empConsultant, TENANT_ID, 'Jane Consultant', 'Senior Advisor', 85000]
  );
  await run(
    `INSERT INTO employees (employee_id, tenant_id, name, position, salary, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [empDirector, TENANT_ID, 'Michael Director', 'Engagement Director', 120000]
  );

  await run(
    `INSERT INTO timesheets (timesheet_id, tenant_id, service_order_id, employee_id, date, hours, description, deliverable)
     VALUES (?, ?, 'so-001', ?, '2026-08-15', 32, 'FM advisory sessions', 'Monthly board pack review')`,
    [uuid(), TENANT_ID, empConsultant]
  );

  await run(
    `INSERT INTO leads (lead_id, tenant_id, name, email, phone, source, score, status)
     VALUES (?, ?, ?, ?, ?, 'web', 75, 'qualified')`,
    ['lead-001', TENANT_ID, 'Prospect Corp', 'contact@prospect.lr', '+231-77-010-0100']
  );

  const invoiceApproved = 'inv-001';
  const invoiceDraft = 'inv-002';
  const taxRate = 8;
  const lineTotal1 = 12500;
  const tax1 = lineTotal1 * (taxRate / 100);
  await run(
    `INSERT INTO invoices (invoice_id, tenant_id, customer_id, engagement_id, issue_date, due_date, total_amount, tax_amount, status, notes)
     VALUES (?, ?, ?, ?, '2026-08-01', '2026-08-31', ?, ?, 'approved', 'August retainer draw-down')`,
    [invoiceApproved, TENANT_ID, 'cust-a', engRetainer, lineTotal1 + tax1, tax1]
  );
  await run(
    `INSERT INTO invoice_lines (invoice_line_id, invoice_id, service_id, description, qty, unit_price, line_total)
     VALUES (?, ?, 'svc-FM-001', 'FM Advisory – August', 1, ?, ?)`,
    [uuid(), invoiceApproved, lineTotal1, lineTotal1]
  );

  const lineTotal2 = 63000;
  const tax2 = lineTotal2 * (taxRate / 100);
  await run(
    `INSERT INTO invoices (invoice_id, tenant_id, customer_id, engagement_id, issue_date, due_date, total_amount, tax_amount, status, notes)
     VALUES (?, ?, ?, ?, '2026-08-10', '2026-09-10', ?, ?, 'draft', 'Project mobilization 30%')`,
    [invoiceDraft, TENANT_ID, 'cust-c', engProject, lineTotal2 + tax2, tax2]
  );
  await run(
    `INSERT INTO invoice_lines (invoice_line_id, invoice_id, service_id, description, qty, unit_price, line_total)
     VALUES (?, ?, 'svc-DD-002', 'Due diligence mobilization', 1, ?, ?)`,
    [uuid(), invoiceDraft, lineTotal2, lineTotal2]
  );

  await run(
    `INSERT INTO payments (payment_id, tenant_id, customer_id, invoice_id, bank_account_id, amount, date, method, reference)
     VALUES (?, ?, ?, ?, ?, ?, '2026-08-20', 'ACH', 'ACH-88421')`,
    [uuid(), TENANT_ID, 'cust-a', invoiceApproved, bankId, lineTotal1 + tax1]
  );

  await run(
    `INSERT INTO bills (bill_id, tenant_id, vendor_id, amount, due_date, wht, status, engagement_id)
     VALUES (?, ?, 'vend-eng', 8500, '2026-09-15', 425, 'pending', ?)`,
    ['bill-001', TENANT_ID, engProject]
  );

  await run(
    `INSERT INTO expense_claims (claim_id, tenant_id, employee_id, amount, service_id, status, description, date)
     VALUES (?, ?, ?, 450, 'svc-FM-001', 'approved', 'Client site travel', '2026-08-12')`,
    [uuid(), TENANT_ID, empConsultant]
  );

  await run(
    `INSERT INTO assets (asset_id, tenant_id, name, cost, acq_date, depreciation_method, nbv, useful_life_years)
     VALUES (?, ?, ?, 12500, '2025-06-01', 'straight_line', 10000, 5)`,
    ['asset-laptop-1', TENANT_ID, 'IT Equipment – Laptops']
  );

  await run(
    `INSERT INTO payroll_runs (payroll_run_id, tenant_id, period, total_gross, paye, pension, net_pay, status)
     VALUES (?, ?, '2026-08', 205000, 42000, 12300, 154700, 'posted')`,
    ['payroll-2026-08', TENANT_ID]
  );

  await run(
    `INSERT INTO bank_transactions (txn_id, bank_account_id, date, amount, description, status)
     VALUES (?, ?, '2026-08-20', ?, 'Customer A – retainer payment', 'matched')`,
    [uuid(), bankId, lineTotal1 + tax1]
  );
  await run(
    `INSERT INTO bank_transactions (txn_id, bank_account_id, date, amount, description, status)
     VALUES (?, ?, '2026-08-05', -1200, 'Bank service charges', 'unmatched')`,
    [uuid(), bankId]
  );

  const portalHash = await bcrypt.hash('Customer@TJ2026', 10);
  await run(
    `INSERT INTO users (user_id, tenant_id, full_name, email, password_hash, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    ['user-portal-a', TENANT_ID, 'Customer A Portal', 'accounts@banka.com', portalHash]
  );
  await run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', ['user-portal-a', 'role-customer-portal']);

  console.log('Seed completed successfully');
  console.log('Login: admin@tjconsultancy.com / Admin@TJ2026');
  console.log('Login: finance@tjconsultancy.com / Finance@TJ2026');
  console.log('Portal: accounts@banka.com / Customer@TJ2026');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
