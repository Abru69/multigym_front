# Contexto del Proyecto — Multigym Front

## Descripción

Plataforma SaaS multi-tenant para gestión integral de gimnasios. Cada tenant opera con su propio branding, usuarios, rutinas, inventario y tienda.

## Stack Tecnológico

| Capa        | Tecnología                  | Versión |
| ----------- | --------------------------- | ------- |
| Framework   | React                       | 19.2.6  |
| Lenguaje    | TypeScript                  | ~6.0.2  |
| Bundler     | Vite                        | 8.0.12  |
| Estilos     | Tailwind CSS v4             | 4.3.0   |
| Animaciones | Framer Motion               | 12.38.0 |
| Iconos      | Lucide React                | 1.14.0  |
| Estado      | Zustand                     | 5.0.13  |
| Rutas       | React Router DOM            | 7.15.0  |
| Gráficas    | Recharts                    | 3.8.1   |
| CSS Utils   | clsx + tailwind-merge + cva | --      |

## Arquitectura Multi-Tenant

- **Resolución:** Por subdominio (`gym1.multigym.com`) o localhost (`gym1.localhost:5173`)
- **Branding:** CSS variables inyectadas en runtime según tenant
- **Backend:** Java en puerto 8080, proxy en Vite (`/api/*` → `localhost:8080`)
- **Headers:** `X-Tenant-ID` del subdominio, `Authorization: Bearer <token>`

## Estructura de Carpetas

```
src/
├── components/
│   ├── ui/              # Button, Card, Modal, Toast, Avatar, Badge, etc.
│   └── layout/          # DashboardLayout
├── features/
│   ├── auth/
│   │   ├── pages/       # Login, Register, ForgotPassword, ResetPassword, ActivateAccount
│   │   └── store/       # authStore.ts
│   ├── platform/
│   │   ├── pages/       # PlatformDashboard, PlatformTenants, PlatformBilling, etc.
│   │   └── store/       # platformAuthStore.ts
│   ├── admin/
│   │   ├── components/  # AdminHeader, SearchBar, ConfirmDialog, FormField, etc.
│   │   └── pages/       # Dashboard, Users, Inventory, Exercises, RoutineBuilder, RoutineLibrary
│   ├── client/
│   │   ├── pages/       # Landing, MyRoutines, Progress, Nutrition, SaaSLanding
│   │   └── store/       # routineStore.ts
│   ├── landing/
│   │   ├── components/  # Hero, Features, Pricing, Footer, RoutineShowcase
│   │   └── pages/       # LandingPage.tsx
│   └── shop/
│       ├── pages/       # Catalog, Cart, Checkout, ProductDetail
│       └── store/       # cartStore.ts
├── hooks/               # useDebounce, useTheme, useTenantBranding
├── layouts/             # AdminLayout, AuthLayout, ClientLayout, PlatformLayout
├── lib/                 # api.ts, tenant.ts, tenantConfig.ts, utils.ts
├── router/              # Rutas + guards (AuthGuard, AdminGuard, PlatformGuard)
├── pages/               # NotFound.tsx (404)
├── types/               # api.ts, exercise.ts, product.ts, user.ts
└── data/                # constants.ts, mock data
```

## Módulos

### 1. Autenticación (`features/auth/`)

- Login JWT con resolución automática de tenant
- Store: `authStore.ts` con persist

### 2. Plataforma SaaS (`features/platform/`)

- Dashboard MRR, tenants, facturación, logs
- Store: `platformAuthStore.ts`

### 3. Admin Gimnasio (`features/admin/`)

- Dashboard KPIs, CRUD usuarios, inventario
- Biblioteca de ejercicios + constructor de rutinas
- Estilos: Tailwind (CSS files eliminados)

### 4. Portal Cliente (`features/client/`)

- Rutinas asignadas, progreso, nutrición
- Store: `routineStore.ts`

### 5. E-Commerce (`features/shop/`)

- Catálogo con filtros, carrito persistente, checkout
- Store: `cartStore.ts`

## Componentes UI Compartidos

| Componente    | Archivo                                       | Uso                            |
| ------------- | --------------------------------------------- | ------------------------------ |
| Modal         | `components/ui/Modal.tsx`                     | Diálogos, formularios          |
| Toast         | `components/ui/Toast.tsx`                     | Notificaciones (store Zustand) |
| ConfirmDialog | `features/admin/components/ConfirmDialog.tsx` | Confirmar eliminación          |
| SearchBar     | `features/admin/components/SearchBar.tsx`     | Búsqueda con debounce          |
| FormField     | `features/admin/components/FormField.tsx`     | Campos de formulario           |
| AdminHeader   | `features/admin/components/AdminHeader.tsx`   | Encabezado de página           |
| Avatar        | `components/ui/Avatar.tsx`                    | Iniciales con color hash       |

## Comandos

```bash
npm run dev           # Desarrollo
npm run build         # Producción (tsc + vite)
npm run lint          # ESLint
npm run lint:fix      # Auto-fix
npm run format        # Prettier
```
