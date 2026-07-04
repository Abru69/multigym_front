# Changelog

Formato: [YYYY-MM-DD]

---

## [2026-07-04]

### Completado

- **Admin Panel Glassmorphism + Depth Redesign**
  - **Concepto visual**: "Frosted Gym" — Paneles de vidrio esmerilado sobre fondo oscuro profundo con acentos de gradiente vibrantes, sombras en capas, bordes luminosos y efectos de luz ambiental
  - **CSS Foundation** (`index.css`): Variables glassmorphism v2 (`--glass-bg-subtle/medium/strong`, `--glass-border`, `--depth-1/2/3/4`, `--gradient-accent/glow/subtle`, `--ambient-glow`), utilidades `.glass-subtle`, `.glass-strong`, `.glass-card`, `.glass-btn-primary`, `.glass-badge`, `.depth-1/2/3/4`
  - **Componentes UI rediseñados**:
    - `Card.tsx` — `border-white/[0.06] bg-white/[0.03] backdrop-blur-xl`, hover con glow sutil
    - `Badge.tsx` — Variantes glass (`glass`, `glass-accent`, `glass-error`, `glass-warning`), `backdrop-blur-md`
    - `Button.tsx` — Variantes `glass`, `glass-accent`, primary con `bg-gradient-to-r`, `active:scale-[0.97]`
    - `Modal.tsx` — `rounded-3xl`, `bg-white/[0.04] backdrop-blur-2xl`, overlay `bg-black/70 backdrop-blur-sm`
    - `SearchBar.tsx` — `rounded-2xl bg-white/[0.04] backdrop-blur-xl`
    - `EmptyState.tsx` — Icono con gradiente, `rounded-2xl border border-white/[0.06]`
    - `ConfirmDialog.tsx` — Icono alerta con gradiente rojo, botones glass
    - `AdminHeader.tsx` — Icono con gradiente `rounded-2xl`, título `font-black tracking-tight`
  - **DashboardLayout.tsx** — Ambient glow `bg-[var(--ambient-glow)]`, nav links con underline+glow, mobile sidebar glass
  - **6 páginas admin rediseñadas**:
    - `Users.tsx` — Cards de usuario glass con gradient avatars, menú contextual glass
    - `Inventory.tsx` — Tabla glass con `backdrop-blur-xl`, filas hover, badges glass
    - `Exercises.tsx` — Muscle group cards glass, segmented tabs con gradiente
    - `RoutineBuilder.tsx` — Exercise cards glass, day tabs con gradiente, detail inputs glass
    - `RoutineLibrary.tsx` — Routine template cards glass
    - `Dashboard.tsx` — Stats cards glass, chart tooltip glass, activity feed dots con glow
  - **Build**: `tsc -b && vite build` y `prettier --write` pasan sin errores
  - **Nota**: Todos los errores de lint son preexistentes (PlatformSettings, router/index, Checkout, ProductDetail)

---

## [2026-07-03]

### Completado

- **Critical Fix: Response Format Mismatch (lista → dto.data)**
  - **Problema**: Backend retorna `PaginatedResult` en campo `dto`, frontend leía de `lista`
  - **Solución**: Todos los componentes ahora leen de `response.dto.data`
  - Archivos corregidos:
    - `Users.tsx` - `response.dto?.data || []`
    - `Dashboard.tsx` - `response.dto?.data || []` (users, workouts, orders)
    - `Inventory.tsx` - `response.dto?.data || []`
    - `Exercises.tsx` - `response.dto?.data || []`
    - `RoutineBuilder.tsx` - `response.dto?.data || []` (exercises + users)
    - `RoutineLibrary.tsx` - `response.dto?.data || []`
    - `Catalog.tsx` - `response.dto?.data || []`
    - `platformDashboardStore.ts` - `response?.dto?.data || []` (tenants + plans)
    - `platformTenantsStore.ts` - `response?.dto?.data || []` (tenants + plans)
    - `platformUsersStore.ts` - `response?.dto?.data || []`

### Completado

- **Backend API Validation & Frontend Fixes**
  - Validación completa de endpoints backend vs expectativas frontend (55 endpoints en 17 controladores)
  - Corregido `RoutineBuilder.tsx`: ruta `/api/tenant/user/getAll` → `/api/tenant/users` (plural coincidente con backend)
  - Implementado `Dashboard.tsx` calculando métricas usando endpoints existentes (`/api/tenant/users`, `/api/workouts`, `/api/orders`) en lugar del inexistente `/api/tenant/dashboard`
  - Agregado tipo `OrderDTO` a `src/types/api.ts` y `src/types/index.ts`
  - Dashboard muestra: clientes activos, ventas del mes, rutinas creadas, clientes sin rutina
  - Gráfico de ingresos mensuales calculado desde órdenes reales
  - Feed de actividad generado desde usuarios, rutinas y órdenes recientes

### Completado

- **Auth Backend Integration — Login, Logout, Forgot Password, Reset Password**
  - `api.ts`: Corregida URL de `activateAccount` (`/api/tenant/user/` → `/api/tenant/users/`)
  - `api.ts`: Agregados `logout()` y `refreshToken()` que llaman `POST /api/auth/logout` y `POST /api/auth/refresh-token`
  - `authStore.ts`: `logout()` ahora llama el endpoint backend antes de limpiar estado local
  - `authStore.ts`: `login()` ahora lanza errores del backend en vez de retornar `false`
  - `Login.tsx`: Muestra el mensaje real del backend (ej: "Invalid credentials", "Tenant not found") en vez de "Credenciales inválidas" genérico
  - `ForgotPassword.tsx`: Migrado de `fetch()` raw a `fetchApi()` para consistencia
  - `ResetPassword.tsx`: Migrado de `fetch()` raw a `fetchApi()`, eliminado input de tenant ID (backend resuelve desde token), minlength corregido a 8
  - `AdminLayout.tsx`, `ClientLayout.tsx`, `TenantDashboard.tsx`, `Landing.tsx`: `handleLogout` actualizado a `async/await` para esperar la llamada al backend antes de redirigir

---

## [2026-07-02]

### Completado

- **Platform Dashboard Summary Metrics**
  - `TenantDTO` actualizado con `memberCount`, `memberLimit`, `planPrice`, `isTrial`
  - `TenantSummaryDTO` agregado para `GET /api/tenants/summary`
  - Platform Dashboard usa métricas reales: tenants activos, miembros totales, MRR y retención
  - Distribución de planes conectada con `GET /api/tenants` + `GET /api/saas-plans`
  - Platform Tenants muestra uso de miembros como `actual / límite` con barra de progreso
  - Platform Tenants muestra insignia `Trial` cuando `isTrial` está activo

### Completado

- **Platform Users API Route Fix**
  - Agregado proxy `/platform-api` en `vite.config.ts` para evitar colisión entre la ruta frontend `/platform/users` y el endpoint backend `/platform/users`
  - Endpoints de Platform Users actualizados a `/platform-api/users` en `src/lib/api.ts`
  - `platformUsersStore.ts` ahora tolera respuestas nulas al cargar usuarios
  - Build passing

### Completado

- **Platform Users Integration**
  - `PlatformUserDTO` y `PlatformUserRequestDTO` agregados a `src/types/api.ts`
  - Funciones API: `getPlatformUsers`, `createPlatformUser`, `updatePlatformUser`, `togglePlatformUserStatus`, `deletePlatformUser`
  - Nuevo store: `src/features/platform/store/platformUsersStore.ts`
  - `PlatformUsers.tsx` reescrito con datos reales del backend
  - Formulario con name, lastName, email, password (create), role
  - Roles: SUPER_ADMIN, SUPPORT, DEVOPS (sin SALES)
  - Toggle status con `PATCH /platform/users/{id}/status`
  - Eliminar con `DELETE /platform/users/{id}` + ConfirmDialog
  - Loading state y error handling
  - Build passing

### Completado

- **Platform Tenants Integration**
  - `TenantDTO` actualizado con `planId` y `trialEndsAt`
  - `SaasPlanDTO` y `TenantRequestDTO` agregados a `src/types/api.ts`
  - Funciones API: `getTenants`, `createTenant`, `deleteTenant`, `toggleTenantStatus`, `getSaasPlans`
  - Nuevo store: `src/features/platform/store/platformTenantsStore.ts`
  - `PlatformTenants.tsx` reescrito con datos reales del backend
  - Columna "Plan" resuelta desde `GET /api/saas-plans`
  - Columna "Límite" con `memberLimit` del plan SaaS
  - Toggle status con `PATCH /api/tenants/{tenantId}/status`
  - Eliminar con `DELETE /api/tenants/{tenantId}` + ConfirmDialog
  - Crear tenant con `planId` real (UUID)
  - Build passing

### Completado

- **Platform Dashboard Integration**
  - `TenantDTO` agregado a `src/types/api.ts`
  - `getTenants()` agregado a `src/lib/api.ts`
  - Nuevo store: `src/features/platform/store/platformDashboardStore.ts`
  - `PlatformDashboard.tsx` ahora usa datos reales del backend
  - Métricas reales: total gymnasios, gymnasios activos, crecimiento, tenants recientes
  - Datos mock: MRR, miembros, retención, actividad reciente (sin endpoint en backend)
  - Build passing

### Completado

- **Auth CSS Migration**
  - AuthShared.css migrado a Tailwind inline
  - 5 páginas auth actualizadas: Login, Register, ForgotPassword, ResetPassword, ActivateAccount
  - Eliminado directorio `src/features/auth/pages/styles/`
  - Lint mejorado: 137 → 134 problemas (3 warnings eliminados)

- **Documentación Corregida**
  - AI_CONTEXT.md: estructura de carpetas real (landing/, layouts/, pages/, stores en features/)
  - PROJECT_STATUS.md: lint issues actualizados (137 vs 197), AuthShared.css agregado a eliminados
  - agent.md: estructura de carpetas real
  - START_HERE.md: estructura + lint numbers actualizados
  - CHANGELOG.md: entrada de corrección

### Eliminado

- `src/features/auth/pages/styles/AuthShared.css`

## [2026-07-02]

### Completado

- **Admin Redesign Total**
  - Dashboard.tsx — Stat cards, recharts chart, activity feed
  - Users.tsx — Modal, Toast, Avatar, SearchBar debounce, ConfirmDialog
  - Inventory.tsx — Modal form, Toast, debounce search, FormField validation
  - Exercises.tsx — Modal exercise list, Toast, Tailwind grid
  - RoutineBuilder.tsx — Modal components, Toast notifications, proper types
  - RoutineLibrary.tsx — ConfirmDialog delete, Toast, SearchBar

- **Componentes Compartidos Creados**
  - AdminHeader — Encabezado de página con icono + acción
  - SearchBar — Búsqueda con clear button + debounce
  - EmptyState — Placeholder para estados vacíos
  - LoadingState — Loading con spinner
  - FormField — Campo de formulario con label + error
  - ConfirmDialog — Modal de confirmación para eliminación
  - useDebounce — Hook de debounce para búsqueda

- **CSS Migration Completada**
  - Eliminados 6 archivos CSS de `src/features/admin/pages/styles/`
  - Todas las páginas migradas a Tailwind CSS

- **TypeScript Fixes**
  - WorkoutDTO: Agregados campos member y exercises
  - ProductDTO, ExerciseDTO: Tipado correcto sin Record<string, unknown>
  - Modal: Prop `subtitle` → `description`

### Eliminado

- `src/features/admin/pages/styles/` (directorio completo)

---

## [2026-07-01]

### Completado

- **Fase 1 — Limpieza de Tipos**
  - `types/api.ts` con DTOs centralizados
  - Eliminados tipos duplicados

- **Fase 2 — Design System**
  - Modal, Select, Textarea, Skeleton, Spinner, Avatar, DropdownMenu, Toast

- **Fase 3 — Lazy Loading**
  - React.lazy() en todas las rutas
  - Página 404 NotFound

- **Fase 4 — Layouts Compartidos**
  - DashboardLayout reutilizado

- **Fase 5 — Landing Page**
  - Hero, RoutineShowcase, Features, Pricing, Footer
  - Sticky header con ThemeToggle

- **Fase 6 — Routine Store**
  - Persist middleware, getTodayExercises(), getWeeklyProgress()

- **Fase 7 — Validation**
  - Build passing
  - CSS bug fix (--bg-secondary)
  - react-is dependency added
