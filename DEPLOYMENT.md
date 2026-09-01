# Production Deployment Guide

TJ Consultancy FMS production architecture:

| Component | Platform | Role |
|-----------|----------|------|
| **Frontend** | Vercel | React SPA |
| **API** | Render (or Railway/Fly) | Node.js Express |
| **Database** | Neon | PostgreSQL |

Neon hosts the database. The Node API runs on a separate host and connects via `DATABASE_URL`.

---

## 1. Neon (database)

Project: `tj-consultancy-fms` · Database: `tj_fms`

1. Copy the connection string from [Neon Console](https://console.neon.tech) (use the **pooled** URL with `sslmode=require`).
2. Provision schema and demo data (one time):

```bash
cd server
export DATABASE_URL='postgresql://USER:PASSWORD@HOST/tj_fms?sslmode=require'
npm run db:provision-neon
```

Or from repo root:

```bash
DATABASE_URL='...' npm run db:provision-neon
```

---

## 2. API (Render)

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New Blueprint** → connect repo (`render.yaml` is included).
3. Set environment variables:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |

4. Deploy. Note the API URL, e.g. `https://tj-fms-api.onrender.com`.
5. Verify: `curl https://tj-fms-api.onrender.com/api/health`

Expected JSON includes `database: "neon-postgres"` and `currency: "USD"`.

### CORS

`CLIENT_URL` accepts comma-separated Vercel URLs. All `*.vercel.app` preview domains are allowed automatically.

---

## 3. Frontend (Vercel)

1. [Vercel Dashboard](https://vercel.com) → **Add New Project** → import `tj_financial_system`.

**Root Directory** (either works):

| Option | Root Directory | Output |
|--------|----------------|--------|
| Recommended | `.` (repo root) | `client/dist` |
| Alternative | `client` | `dist` |

2. **Environment Variables** (Production + Preview):

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://tj-fms-api.onrender.com/api` |

3. Deploy — build runs `build:vercel` (Vite + `api-config.js`).

4. Update Render `CLIENT_URL` to your Vercel URL after first deploy.

---

## 4. Post-deploy checklist

- [ ] `GET /api/health` returns `neon-postgres` and `USD`
- [ ] Login works from Vercel URL
- [ ] Settings shows Liberia + USD
- [ ] No CORS errors in browser console

### Demo logins (if seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tjconsultancy.com` | `Admin@TJ2026` |
| Portal | `accounts@banka.com` | `Customer@TJ2026` |

---

## Local vs production

| | Local | Production |
|---|--------|------------|
| Frontend | `npm run dev` → :5173 | Vercel |
| API | :4000 | Render |
| Database | SQLite (no `DATABASE_URL`) | Neon (`DATABASE_URL` required) |

---

## Troubleshooting

**CORS errors** — Set `CLIENT_URL` on the API to your Vercel URL (with `https://`, no trailing slash).

**API returns 500** — Check Render logs; confirm `DATABASE_URL` is set and Neon provision ran.

**Frontend can't reach API** — Confirm `VITE_API_URL` ends with `/api` and redeploy Vercel after changing it.

**NGN showing** — Run `npm run db:patch-usd` against Neon, then sign out and sign in again.
