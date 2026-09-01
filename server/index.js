import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth.js';
import { attachPermissions } from './middleware/rbac.js';
import { isOriginAllowed } from './lib/cors.js';
import * as authRoutes from './routes/auth.js';
import * as dashboardRoutes from './routes/dashboard.js';
import * as customerRoutes from './routes/customers.js';
import * as serviceRoutes from './routes/services.js';
import * as engagementRoutes from './routes/engagements.js';
import * as invoiceRoutes from './routes/invoices.js';
import * as billRoutes from './routes/bills.js';
import * as journalRoutes from './routes/journals.js';
import * as bankingRoutes from './routes/banking.js';
import * as reportRoutes from './routes/reports.js';
import * as auditRoutes from './routes/audit.js';
import * as vendorRoutes from './routes/vendors.js';
import * as crmRoutes from './routes/crm.js';
import * as timesheetRoutes from './routes/timesheets.js';
import * as paymentRoutes from './routes/payments.js';
import * as expenseRoutes from './routes/expenses.js';
import * as payrollRoutes from './routes/payroll.js';
import * as assetRoutes from './routes/assets.js';
import * as taxRoutes from './routes/tax.js';
import * as periodRoutes from './routes/periods.js';
import * as portalRoutes from './routes/portal.js';
import * as settingsRoutes from './routes/settings.js';
import { CURRENCY, COUNTRY } from './constants.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, isOriginAllowed(origin));
    },
    credentials: true,
  })
);
app.use(express.json());
app.set('trust proxy', 1);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    brand: 'TJ CONSULTANCY INC.',
    version: '1.0',
    currency: CURRENCY,
    country: COUNTRY,
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'neon-postgres' : 'sqlite',
  });
});

app.post('/api/auth/login', authRoutes.login);
app.get('/api/auth/me', authMiddleware, authRoutes.getMe);

const api = express.Router();
api.use(authMiddleware);
api.use(attachPermissions);

api.get('/dashboard', dashboardRoutes.getDashboard);
api.get('/customers', customerRoutes.list);
api.get('/customers/:id', customerRoutes.getById);
api.post('/customers', customerRoutes.create);
api.put('/customers/:id', customerRoutes.update);

api.get('/services', serviceRoutes.list);
api.get('/vendors', vendorRoutes.list);
api.get('/chart-of-accounts', crmRoutes.listCoa);
api.get('/leads', crmRoutes.listLeads);
api.post('/leads', crmRoutes.createLead);

api.get('/engagements', engagementRoutes.list);
api.get('/engagements/:id', engagementRoutes.getById);
api.post('/engagements', engagementRoutes.create);

api.get('/invoices', invoiceRoutes.list);
api.get('/invoices/:id', invoiceRoutes.getById);
api.post('/invoices', invoiceRoutes.create);
api.post('/invoices/:id/approve', invoiceRoutes.approve);
api.post('/engagements/:engagementId/generate-invoice', invoiceRoutes.generateFromEngagement);

api.get('/bills', billRoutes.list);
api.post('/bills', billRoutes.create);
api.post('/bills/:id/approve', billRoutes.approve);

api.get('/journals', journalRoutes.list);
api.get('/journals/trial-balance', journalRoutes.trialBalance);
api.get('/journals/:id', journalRoutes.getById);
api.post('/journals', journalRoutes.createManual);

api.get('/banking/accounts', bankingRoutes.listAccounts);
api.get('/banking/transactions', bankingRoutes.listTransactions);
api.get('/banking/reconciliation', bankingRoutes.reconciliationSummary);
api.post('/banking/import', bankingRoutes.importTransactions);

api.get('/timesheets', timesheetRoutes.list);
api.post('/timesheets', timesheetRoutes.create);

api.get('/payments', paymentRoutes.list);
api.post('/payments', paymentRoutes.create);

api.get('/expenses', expenseRoutes.list);
api.post('/expenses', expenseRoutes.create);
api.post('/expenses/:id/approve', expenseRoutes.approve);

api.get('/employees', payrollRoutes.listEmployees);
api.get('/payroll', payrollRoutes.listRuns);
api.post('/payroll', payrollRoutes.createRun);
api.post('/payroll/:id/post', payrollRoutes.postRun);

api.get('/assets', assetRoutes.list);
api.post('/assets', assetRoutes.create);
api.get('/assets/depreciation-schedule', assetRoutes.depreciationSchedule);

api.get('/tax/codes', taxRoutes.listCodes);
api.get('/tax/schedules', taxRoutes.schedules);

api.get('/periods', periodRoutes.list);
api.post('/periods/:id/close', periodRoutes.closePeriod);
api.post('/periods/:id/reopen', periodRoutes.reopenPeriod);

api.get('/settings/tenant', settingsRoutes.getTenantSettings);
api.put('/settings/tenant', settingsRoutes.updateTenantSettings);

api.get('/portal/dashboard', portalRoutes.dashboard);
api.get('/portal/statement', portalRoutes.statement);

api.get('/reports/income-statement', reportRoutes.incomeStatement);
api.get('/reports/balance-sheet', reportRoutes.balanceSheet);
api.get('/reports/cash-flow', reportRoutes.cashFlow);
api.get('/reports/customer-pnl', reportRoutes.customerPnL);
api.get('/reports/service-pnl', reportRoutes.servicePnL);

api.get('/audit-log', auditRoutes.list);

app.use('/api', api);

app.listen(PORT, () => {
  console.log(`TJ Consultancy FMS API running on http://localhost:${PORT} (${CURRENCY})`);
});
