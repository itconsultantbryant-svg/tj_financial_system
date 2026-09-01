-- TJ Consultancy FMS — Core Schema (SQLite / PostgreSQL compatible)

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  tenant_name TEXT NOT NULL,
  branding TEXT,
  currency TEXT DEFAULT 'USD',
  fiscal_year_start INTEGER DEFAULT 1,
  default_tax_code TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1a365d',
  secondary_color TEXT DEFAULT '#c9a227',
  tagline TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
  role_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  permissions TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  mfa_enabled INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  account_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS tax_codes (
  tax_code_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  rate REAL NOT NULL,
  gl_account_id TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS services (
  service_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  revenue_account_id TEXT,
  cogs_account_id TEXT,
  pricing_basis TEXT,
  tax_code_id TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  tax_id TEXT,
  portal_access INTEGER DEFAULT 0,
  credit_limit REAL DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending',
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS vendors (
  vendor_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  tax_id TEXT,
  bank_info TEXT,
  wht_applicable INTEGER DEFAULT 0,
  email TEXT,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  salary REAL DEFAULT 0,
  bank_info TEXT,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS engagements (
  engagement_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'active',
  monthly_fee REAL DEFAULT 0,
  retainer_balance REAL DEFAULT 0,
  milestone_schedule TEXT,
  retention_pct REAL DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS service_orders (
  service_order_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  engagement_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  qty REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  status TEXT DEFAULT 'open',
  description TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (engagement_id) REFERENCES engagements(engagement_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS timesheets (
  timesheet_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  service_order_id TEXT NOT NULL,
  employee_id TEXT,
  date TEXT NOT NULL,
  hours REAL DEFAULT 0,
  description TEXT,
  deliverable TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (service_order_id) REFERENCES service_orders(service_order_id)
);

CREATE TABLE IF NOT EXISTS invoices (
  invoice_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  engagement_id TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  total_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS invoice_lines (
  invoice_line_id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  service_id TEXT,
  description TEXT,
  qty REAL DEFAULT 1,
  unit_price REAL DEFAULT 0,
  line_total REAL DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  invoice_id TEXT,
  bank_account_id TEXT,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  method TEXT,
  reference TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS bills (
  bill_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT,
  wht REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  engagement_id TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

CREATE TABLE IF NOT EXISTS bill_lines (
  bill_line_id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL,
  service_id TEXT,
  amount REAL DEFAULT 0,
  description TEXT,
  FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS expense_claims (
  claim_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  employee_id TEXT,
  amount REAL NOT NULL,
  service_id TEXT,
  status TEXT DEFAULT 'pending',
  description TEXT,
  date TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS journal_entries (
  journal_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  source_module TEXT,
  source_id TEXT,
  posted_by TEXT,
  status TEXT DEFAULT 'posted',
  period_id TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS journal_lines (
  line_id TEXT PRIMARY KEY,
  journal_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  service_id TEXT,
  customer_id TEXT,
  vendor_id TEXT,
  FOREIGN KEY (journal_id) REFERENCES journal_entries(journal_id),
  FOREIGN KEY (account_id) REFERENCES chart_of_accounts(account_id)
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  bank_account_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_no TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT DEFAULT 'operating',
  balance REAL DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  txn_id TEXT PRIMARY KEY,
  bank_account_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  matched_invoice_id TEXT,
  matched_bill_id TEXT,
  status TEXT DEFAULT 'unmatched',
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(bank_account_id)
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cost REAL NOT NULL,
  acq_date TEXT,
  depreciation_method TEXT DEFAULT 'straight_line',
  nbv REAL,
  useful_life_years INTEGER DEFAULT 5,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  payroll_run_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  period TEXT NOT NULL,
  total_gross REAL DEFAULT 0,
  paye REAL DEFAULT 0,
  pension REAL DEFAULT 0,
  net_pay REAL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS quotes (
  quote_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  lead_id TEXT,
  customer_id TEXT,
  total_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  valid_until TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS quote_lines (
  quote_line_id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  description TEXT,
  qty REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  FOREIGN KEY (quote_id) REFERENCES quotes(quote_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS fiscal_periods (
  period_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  status TEXT DEFAULT 'open',
  locked_by TEXT,
  locked_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  log_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  before_json TEXT,
  after_json TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  ip TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE IF NOT EXISTS reports (
  report_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  period_id TEXT,
  generated_at TEXT DEFAULT (datetime('now')),
  generated_by TEXT,
  file_url TEXT,
  data_json TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_service ON journal_lines(service_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
