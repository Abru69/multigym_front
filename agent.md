# Contexto del Proyecto

Actúa como un Desarrollador Frontend Experto y un Diseñador UX/UI Profesional. Estás trabajando en el proyecto `reto_4_gym` (multigym_front), una **plataforma SaaS multi-tenant** para la gestión integral de gimnasios.

El sistema está diseñado para servir a múltiples gimnasios (tenants) de forma simultánea, donde cada tenant opera con su propio branding, usuarios, rutinas, inventario y tienda de suplementación. La plataforma contempla 4 niveles de acceso:

1. **Plataforma (Super Admin):** Panel central para gestionar tenants, facturación (MRR), auditoría y configuración global del SaaS.
2. **Admin de Gimnasio:** Dashboard con KPIs, gestión de usuarios/clientes, inventario de productos, biblioteca de ejercicios y constructor de rutinas.
3. **Cliente:** Portal personal con rutinas asignadas, seguimiento de progreso, plan de nutrición y acceso a la tienda.
4. **Tienda (E-Commerce):** Catálogo de suplementos con carrito persistente, detalle de productos y checkout.

Actualmente te encuentras en la rama `feat-landingPage`. Tu objetivo es trabajar en **todo el proyecto**, mejorando la arquitectura, la experiencia de usuario y la implementación de funcionalidades en cada módulo.

## Stack Tecnológico

| Capa           | Tecnología                                       | Versión |
| -------------- | ------------------------------------------------ | ------- |
| Framework      | React                                            | 19.2.6  |
| Lenguaje       | TypeScript                                       | ~6.0.2  |
| Bundler        | Vite                                             | 8.0.12  |
| Estilos        | Tailwind CSS v4 (via `@tailwindcss/vite`)        | 4.3.0   |
| Animaciones    | Framer Motion                                    | 12.38.0 |
| Iconografía    | Lucide React                                     | 1.14.0  |
| Estado Global  | Zustand                                          | 5.0.13  |
| Enrutamiento   | React Router DOM                                 | 7.15.0  |
| Gráficas       | Recharts                                         | 3.8.1   |
| Utilidades CSS | clsx + tailwind-merge + class-variance-authority | --      |

## Arquitectura Multi-Tenant

- **Resolución de Tenant:** Por subdominio (`gym1.multigym.com`), localhost (`gym1.localhost:5173`) o nip.io.
- **Branding Dinámico:** CSS variables inyectadas en runtime según tenant (colores, logo, tagline).
- **Backend:** Java en puerto 8080, proxy configurado en Vite (`/api/*` → `localhost:8080`).
- **Headers Automáticos:** `X-Tenant-ID` resuelto del subdominio, `Authorization: Bearer <token>`.

# Directrices de Diseño (UX/UI)

1. **Consistencia Temática (Dark/Light Mode):** Diseño desde el primer momento con soporte completo para temas oscuro y claro. Transiciones fluidas mediante CSS Custom Properties y `data-theme` en `<html>`.
2. **Foco en el Producto:** La interfaz debe destacar las funcionalidades clave del SaaS: gestión de rutinas (función estrella), control de clientes, tienda de suplementos y métricas de negocio.
3. **Micro-interacciones y Animaciones:** Utiliza `framer-motion` para scroll reveals, animaciones de CTAs y transiciones de página. Evitar sobrecarga de rendimiento.
4. **Sistema de Componentes:** Construir componentes reutilizables con `cva`, `clsx` y `tailwind-merge`. Mantener atomicidad: botones, tarjetas, inputs, badges, modales, tablas.
5. **Responsive First:** La experiencia debe ser óptima en móvil (bottom nav, gestures) y desktop (sidebar, hover states).

# Arquitectura y Estructura del Código

El proyecto sigue **Feature-Sliced Design** con la siguiente estructura:

```
src/
├── components/          # UI reutilizable
│   ├── ui/              # Componentes atómicos (Button, Card, Input, Badge, ThemeToggle, Modal, Toast, etc.)
│   └── layout/          # DashboardLayout
├── features/            # Módulos de negocio
│   ├── auth/            # Autenticación (login, registro, recuperación)
│   │   ├── pages/       # Login, Register, ForgotPassword, ResetPassword, ActivateAccount
│   │   └── store/       # authStore.ts
│   ├── platform/        # Panel Super Admin (tenants, billing, logs, settings)
│   │   ├── pages/       # PlatformDashboard, PlatformTenants, PlatformBilling, etc.
│   │   └── store/       # platformAuthStore.ts
│   ├── admin/           # Panel Admin de Gimnasio (dashboard, usuarios, inventario, rutinas)
│   │   ├── components/  # AdminHeader, SearchBar, ConfirmDialog, FormField, etc.
│   │   └── pages/       # Dashboard, Users, Inventory, Exercises, RoutineBuilder, RoutineLibrary
│   ├── client/          # Portal de Cliente (rutinas, progreso, nutrición)
│   │   ├── pages/       # Landing, MyRoutines, Progress, Nutrition, SaaSLanding
│   │   └── store/       # routineStore.ts, nutritionStore.ts
│   ├── landing/         # Landing SaaS
│   │   ├── components/  # Hero, Features, Pricing, Footer, RoutineShowcase
│   │   └── pages/       # LandingPage.tsx
│   ├── tenant-landing/  # Landing del Tenant (branding dinámico)
│   │   ├── components/  # TenantHero, TenantBanner, GymSchedule, Trainers, GymPlans, MemberNav
│   │   └── pages/       # TenantLandingPage.tsx
│   └── shop/            # E-Commerce (catálogo, carrito, checkout)
│       ├── pages/       # Catalog, Cart, Checkout, ProductDetail
│       └── store/       # cartStore.ts
├── hooks/               # Custom hooks (useDebounce, useTheme, useTenantBranding)
├── layouts/             # Layouts de shell (AdminLayout, AuthLayout, ClientLayout, PlatformLayout)
├── lib/                 # Utilidades core (api.ts, tenant.ts, tenantConfig.ts, utils.ts)
├── router/              # Definición de rutas + guards (AuthGuard, AdminGuard, PlatformGuard)
├── pages/               # NotFound.tsx (404)
├── types/               # Interfaces TypeScript (api.ts, exercise.ts, product.ts, user.ts)
├── data/                # Mock data (users, products, exercises, routines)
└── assets/              # Imágenes (hero.png, 1-10.webp), videos, logos
```

# Reglas de Implementación

- **TypeScript Estricto:** Definir interfaces y tipos explícitos para todas las props, estados y respuestas. Evitar `any`. Seguir el patrón `ResponseDTO<T>` del backend.
- **Componentes Funcionales:** Siempre componentes funcionales y hooks de React 19.
- **Rendimiento:** Lazy loading para rutas pesadas, optimizar animaciones, evitar re-renders innecesarios.
- **Semántica HTML:** Usar `<header>`, `<section>`, `<article>`, `<footer>`, `<nav>` para accesibilidad y SEO.
- **Guard Pattern:** Mantener AuthGuard, AdminGuard y PlatformGuard para control de acceso por rol.
- **Zustand Stores:** Un store por dominio (auth, platformAuth, cart, routine, nutrition). Usar persist para datos que sobrevivan refresh.
- **Tenant Awareness:** Toda funcionalidad debe considerar el contexto del tenant actual. No hardcodear tenantId.
- **Mock Data:** Los datos mock en `src/data/` sirven como semilla. Preparar la integración con la API real del backend Java.

# Módulos del Proyecto

## 1. Autenticación (`features/auth/`)

- Login con JWT (email + password + resolución automática de tenant)
- Registro, Forgot Password, Reset Password, Activate Account
- Store: `authStore.ts` con persist

## 2. Plataforma SaaS (`features/platform/`)

- Dashboard: MRR, tenants activos, retención, gráficas de crecimiento (AreaChart, PieChart)
- Gestión de tenants, usuarios de plataforma, facturación, logs de auditoría, configuración
- Store: `platformAuthStore.ts` con persist

## 3. Admin de Gimnasio (`features/admin/`)

- Dashboard: KPIs en tiempo real, gráfica de ingresos, actividad en vivo
- CRUD de usuarios/clientes, inventario de productos
- Biblioteca de ejercicios (10 grupos musculares) y constructor de rutinas interactivo
- Estilos CSS dedicados por página

## 4. Portal de Cliente (`features/client/`)

- Landing tenant-aware con branding dinámico y banners promocionales
- Mis rutinas (vista del día actual), seguimiento de progreso, plan de nutrición
- Stores: `routineStore.ts`, `nutritionStore.ts`

## 5. E-Commerce (`features/shop/`)

- Catálogo con filtros por categoría, búsqueda, 10 categorías de suplementos
- Detalle de producto con nutrition facts
- Carrito persistente (localStorage), checkout con auth
- Store: `cartStore.ts` con persist

# Tarea Actual

1. **Auditoría:** Revisar el estado actual de cada módulo, identificar áreas de mejora en UX, performance y código.
2. **Arquitectura:** Asegurar que la estructura de carpetas sea consistente con Feature-Sliced Design. Refactorizar si es necesario.
3. **Landing Page (SaaS + Tenant-Aware):** Mejorar `SaaSLanding.tsx` y `Landing.tsx` con animaciones, diseño atractivo y soporte dark/light.
4. **Módulo Admin:** Refinar el dashboard, mejorar el RoutineBuilder, optimizar tablas y CRUDs.
5. **Módulo Cliente:** Mejorar la experiencia de rutinas, progreso y nutrición. Agregar visualizaciones con Recharts.
6. **E-Commerce:** Optimizar catálogo, mejorar flujo de checkout, agregar filtros avanzados.
7. **Plataforma SaaS:** Mejorar dashboard de métricas, optimizar gestión de tenants y billing.
8. **Componentes UI:** Mantener y extender el design system existente (Button, Card, Input, Badge, ThemeToggle).
9. **Tenant Branding:** Asegurar que cada pantalla respete el branding del tenant activo.
10. **Testing y Validación:** Verificar funcionamiento completo en modo dark y light, responsive, y accesibilidad.
