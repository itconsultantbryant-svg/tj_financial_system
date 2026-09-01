# TJ CONSULTANCY INC. – Financial Management System

Web-based Financial Management System (FMS) for TJ Consultancy Inc. — service-aware revenue tracking, double-entry GL, AR/AP, banking, and financial reporting.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript), jQuery, Vite |
| Backend | Node.js, Express |
| Local DB | SQLite (`better-sqlite3`) |
| Production DB | Neon PostgreSQL |
| Frontend hosting | Vercel |
| API hosting | Render / Railway / Fly.io (with Neon `DATABASE_URL`) |

## Quick Start (Local)

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000

### Demo logins

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@tjconsultancy.com` | `Admin@TJ2026` |
| Finance Director | `finance@tjconsultancy.com` | `Finance@TJ2026` |

## Project Structure

```
F_System/
├── client/          # React frontend (Vercel)
├── server/          # Node.js API
├── assets/          # TJ logo and brand assets
└── vercel.json      # Vercel deployment config
```

## Currency

TJ Consultancy Inc. delivers advisory services from **Monrovia, Liberia**. All amounts are in **USD** only (tenant default, bank accounts, reports, and UI formatting). NGN is not used.

To patch an existing database to USD:

```bash
npm run db:patch-usd
```

To reset local SQLite and reseed with USD demo data:

```bash
npm run db:reset-local -w server
npm run db:init && npm run db:seed
```

## Modules (Phase 1–2)

- KPI Dashboard with service revenue, AR aging, retainer balances
- CRM: Leads, customers, engagements, timesheets (Retainer SD-012 / Project SD-013)
- Service Catalog: 19 service codes (FM-001 … NS-019) with CoA mapping
- General Ledger: Trial balance, journal entries, double-entry posting
- Accounts Receivable: Invoices, approval workflow, auto-post to GL
- Accounts Payable: Vendor bills and approval
- Collections: Payment recording and bank matching
- Expense claims with approval workflow
- Payroll runs and employee register
- Fixed assets register and depreciation schedule
- Tax: Sales tax, WHT, payroll tax schedules
- Banking: Account balances, transaction import, reconciliation
- Period close: Lock/reopen fiscal periods
- Customer portal: Invoices, payments, statements (USD)
- Financial Reports: Income Statement, Balance Sheet, Cash Flow, Customer/Service P&L
- Audit Trail: Append-only activity log
- Multi-tenant settings: Branding, CoA, fiscal calendar

## Neon PostgreSQL Setup

A Neon project `tj-consultancy-fms` is provisioned. Set your connection string in `server/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/tj_fms?sslmode=require
JWT_SECRET=your-long-random-secret
CLIENT_URL=https://your-vercel-app.vercel.app
PORT=4000
```

Initialize production database:

```bash
cd server
npm run db:init
npm run db:seed
```

## Production deployment

Full step-by-step guide: **[DEPLOYMENT.md](DEPLOYMENT.md)**

| Layer | Platform |
|-------|----------|
| Frontend | **Vercel** — set `VITE_API_URL` to `https://your-api-host.com/api` |
| API | **Render** — `render.yaml` blueprint, `DATABASE_URL` from Neon |
| Database | **Neon** — `npm run db:provision-neon` (one time) |

## Branding

Logo: `assets/TJ_Logo.png` (also in `client/public/logo.png`)

Brand: **TJ CONSULTANCY INC.** — navy (`#1a365d`) and gold (`#c9a227`).

## Specification

Based on TJ Consultancy Inc. FMS Functional & Technical Specification v1.0 (August 30, 2026).

## License

Proprietary — TJ Consultancy Inc.
