# Next Session

**Last session:** 2026-07-17 — Platform Analytics Frontend (Etapa 5 + Analytics)

## Completed Recent

- ✅ **Platform Analytics Frontend** — 5-tab analytics page at `/platform/analytics`
  - **Overview** — MRR, ARR, ARPU, LTV, churn rate, retention rate, tenant status breakdown
  - **Revenue by Tenant** — table with tenant name, plan, price, total revenue, monthly revenue, payments, failed
  - **Plans** — plan breakdown with MRR, active/total tenants, total revenue
  - **Churn & Retention** — churn rate, retention rate, 30d/90d churned, monthly churn table
  - **Failed Payments** — total failed, needs retry, failed amount, recent failed table
- ✅ **7 API functions** — `getPlatformAnalytics`, `getMrrReport`, `getChurnRetention`, `getPlanAnalytics`, `getFailedPayments`, `exportPlatformDashboard`, `exportPlatformAnalytics`
- ✅ **8 TypeScript types** — `MrrReportDTO`, `TenantRevenueDTO`, `ChurnRetentionDTO`, `PlanAnalyticsDTO`, `FailedPaymentReportDTO`, `PlatformAnalyticsDTO`, `TenantExpirationAlert`, updated `PlatformDashboardDTO`/`TenantHealthDTO`
- ✅ **StatusBadge component** — shared `src/components/ui/StatusBadge.tsx`
- ✅ **TenantStatus type** — updated to `TRIAL | ACTIVE | PAST_DUE | SUSPENDED | CANCELLED`
- ✅ **MercadoPago fix** — removed `identificationType`/`identificationNumber` from card token creation
- ✅ **All 6 etapas** of Subscription Renewal Plan completed

## Current Architecture

### Frontend (multigym_front)
- React 19, TypeScript 6, Vite 8, Tailwind 4, Zustand 5
- PWA with Workbox
- Platform admin: 9 pages (Dashboard, Tenants, Users, SaaS Plans, Billing, Reports, Analytics, Logs, Settings)

### Backend (multigym_back)
- Spring Boot 3.3.5, Java 17, PostgreSQL 16, Redis 7
- 139 tests pass
- 167 endpoints consumed by frontend (~84% coverage)

## Key Files

### Frontend
- `src/features/platform/pages/PlatformAnalyticsPage.tsx` — NEW analytics page (5 tabs)
- `src/types/api.ts` — all DTO types
- `src/lib/api.ts` — all API functions
- `src/router/lazyRoutes.ts` — lazy imports
- `src/router/index.tsx` — routes
- `src/layouts/PlatformLayout.tsx` — nav items

### Backend
- `src/main/java/com/hh/ss/multigym/service/PlatformAnalyticsService.java` — MRR, churn, ARPU/LTV
- `src/main/java/com/hh/ss/multigym/controller/PlatformReportController.java` — 6 analytics endpoints
- `src/main/java/com/hh/ss/multigym/dto/report/` — 7 DTOs

## Backend Analytics Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/platform/reports/analytics` | Full analytics (MRR + churn + plans + failed + ARPU) |
| `GET /api/platform/reports/mrr` | MRR report with per-tenant breakdown |
| `GET /api/platform/reports/churn-retention` | Churn rate and retention rate |
| `GET /api/platform/reports/plan-analytics` | Revenue by plan |
| `GET /api/platform/reports/failed-payments` | Failed payment report |
| `GET /api/platform/reports/analytics/export?format=` | Export analytics CSV/PDF/XLSX |

## Local Test Setup

### Backend
```bash
cd multigym_back
docker compose up -d postgres redis
sh "./mvnw" spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd multigym_front
npm run dev
# Runs on http://localhost:5173
```

### Platform Login
- URL: `http://localhost:5173/platform/login`
- Email: `admin@saas.com`
- Password: `admin123`

### Tenant Login
- URL: `http://localhost:5173/login`
- Email: `client@gymx.com`
- Password: `admin123`

## Known Issues
- Embedded PostgreSQL cannot allocate shared memory — unit tests only
- `GET /api/audits` returns 500 — backend bug pending fix
- 132 lint errors (pre-existing: react-refresh, no-unused-vars, jsx-a11y)

## Mercado Pago Sandbox
- Site: MLM (Mexico), MXN currency
- Access Token: `TEST-...` (sandbox)
- Public Key: `TEST-...` (sandbox)
- Test cards: Visa `4075 5957 1648 3764`, Mastercard `5474 9254 3267 0366`, CVV `123`, exp `11/30`
- Scenarios: APRO (approved), OTHE (rejected), CONT (pending), CALL, FUND, SECU, EXPI, FORM
