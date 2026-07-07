# Changelog

Formato: [YYYY-MM-DD]

---

## [2026-07-07]

### Completado

- **Order Pickup Flow (Flujo de Recogida)**
  - `OrderStatus` enum con transiciones válidas: PENDING→READY→COMPLETED, CANCELLED
  - Admin puede marcar "Listo" (valida pago, branch, delivery method)
  - Admin puede marcar "Entregado" cuando cliente recoge en sucursal
  - Admin puede "Cancelar" órdenes PENDING o READY
  - Badge azul "Listo para Recoger" en MyOrders con mensaje contextual
  - PickupVoucher: modal con QR code, número de orden, sucursal, artículos, total
  - Botón "Ver Comprobante" para clientes con órdenes READY
  - `qrcode.react` para generación de QR codes

- **Delivery Methods (Métodos de Entrega)**
  - Checkout rediseñado: flujo de 3 pasos (método → detalles → pago)
  - Selección de método: Recogida en Sucursal o Envío a Domicilio
  - Recogida: selector de sucursal (.Branch) con nombre, dirección, teléfono
  - Envío: formulario de dirección (calle, código postal, ciudad)
  - MyOrders: badge de método de entrega, muestra sucursal o dirección, filtro por tipo
  - Pickups.tsx: vista admin de pedidos de recogida, botón "Marcar Listo"
  - Shipments.tsx: vista admin de envíos a domicilio con dirección
  - DeliverySettings.tsx: toggle habilitar/deshabilitar recogida y envío por tenant
  - AdminLayout: nav items para Recogidas, Envíos, Métodos de Entrega
  - API: getBranches, getTenantSettings, updateTenantSettings, markOrderReady

### Backend (multigym_back)

- Branch entity + BranchController (`GET /api/branches`, `GET /api/branches/{id}`)
- TenantSetting entity + TenantSettingController (`GET/PUT /api/tenant-settings`)
- Order: +deliveryMethod, +branch (ManyToOne), +shipping fields
- OrderDTO/OrderRequest: delivery fields (deliveryMethod, branchId, shipping*)
- OrderMapper: maps delivery + branch info
- OrderService: deliveryMethod filter, markReadyForPickup(), branch validation
- OrderController: PATCH `/{id}/ready`, deliveryMethod query param
- SecurityConfig: branches, tenant-settings, orders/ready rules
- V5 branches, V6 order delivery fields, V7 tenant settings migrations

### Completado

- **Platform Audit Logs integrados**
  - `AuditLogDTO` y `PaginatedResult<T>` agregados a `api.ts`
  - `getAudits()` con 5 filtros: action, entityName, tenantId, fromDate, toDate + paginación
  - Nuevo store: `platformLogsStore.ts` con filtros, paginación, `loadLogs()`
  - `PlatformLogs.tsx` reescrito: timeline UI, filtros, paginación, timestamps relativos
  - Dashboard "Actividad Reciente" consume `GET /api/audits?size=6` (eliminó datos mock)

- **Toggle rápido de estado**
  - Gimnasios: click en badge de estado activa/suspende tenant (`PATCH /api/tenants/{id}/status`)
  - Usuarios: click en badge activa/desactiva usuario (`PATCH /platform-api/users/{id}/status`)
  - Sort alfabético en Gimnasios (`localeCompare`) para evitar reorden al cambiar estado

- **Fix dropdowns en Platform**
  - Eliminado `overflow-hidden` de DropdownMenu (causaba clipping)
  - z-index bump `z-10` → `z-50` para menus sobre contenido
  - `stopPropagation` en trigger para evitar toggle accidental
  - `type="button"` en todos los botones de menú
  - Cierre de menú antes de acción asíncrona (toggle/delete)
  - Header "Acciones" agregado en tabla de Usuarios

- **My Orders page** (`/app/mis-ordenes`)
  - Página con órdenes expandibles: items, payment method, referencia, total
  - Sort por fecha (default: recientes primero) y por total
  - Summary cards: total órdenes, completadas, monto gastado
  - Empty state con link a tienda, error state con retry
  - Animaciones expand/collapse con AnimatePresence
- **Checkout integrado con backend**
  - Envía `items[]`, `paymentMethod`, `shippingAmount` a `POST /api/orders`
  - Eliminó llamada incorrecta a `/api/payments` (endpoint de suscripciones)
  - Error handling: toast + `console.error`, NO limpia carrito en error
  - Campo "Nombre en la Tarjeta" agregado
- **Image mapping fixes**
  - `imageUrl`/`videoUrl` en ProductDTO mapeados a `image`/`video`
  - Catalog, ProductDetail, Inventory, routineStore: fallback `p.imageUrl || p.image`
- **Router + Navigation**
  - Ruta `/app/mis-ordenes` con lazy loading
  - Link "Mis Órdenes" con icono `Package` en ClientLayout
- **Types**: `OrderItemDTO` agregado a `api.ts` y `index.ts`
- Build: `vite build` ✅ (517ms)

---

## [2026-07-06]

### Completado

- **Conexión de 30 endpoints restantes al frontend**
  - **Types**: +12 DTO/Request types — `MemberListItemDTO`, `PlanListItemDTO`, `SubscriptionListItemDTO`, `PaymentListItemDTO`, `WorkoutExerciseListItemDTO`, `WorkoutLogListItemDTO` + 6 Request types
  - **API**: +17 funciones — `getMembers`, `createMember`, `updateMember`, `deleteMember`, `getMemberById`, `getPlans`, `createPlan`, `updatePlan`, `deletePlan`, `togglePlanStatus`, `getPlanById`, `getSubscriptions`, `createSubscription`, `cancelSubscription`, `getSubscriptionsByMember`, `getPayments`, `createPayment`, `getPaymentsBySubscription`, `getWorkoutExercises`, `createWorkoutExercise`, `updateWorkoutExercise`, `deleteWorkoutExercise`, `getWorkoutLogs`, `createWorkoutLog`, `updateWorkoutLog`
  - **4 páginas admin creadas**: Members.tsx, Plans.tsx, Subscriptions.tsx, Payments.tsx
  - **routineStore.ts**: `loadRoutines()` ahora llama `GET /api/workouts` + `GET /api/workout-exercises/{id}` en vez de mockRoutines
  - **Checkout.tsx**: `handleSimulatePayment` ahora crea orden real via `POST /api/orders` + `POST /api/payments`
  - **AdminLayout.tsx**: +4 nav items (Miembros, Planes, Suscripciones, Pagos)
  - **Router**: +4 lazy routes bajo `/admin/`
  - Build: `tsc --noEmit` ✅ | `vite build` ✅ (1.76s)

- **Dark Theme Near-Black** — `#0a0a0a` base, `#141414` cards, `#aaff00` accent
- **Rediseño Total** — 37 archivos, ~439 reemplazos, estructuras nuevas

- **CSS Foundation** (`index.css`):
  - Dark theme variables: `--bg-primary: #0a0a0a`, `--bg-secondary: #111111`, `--surface: #1a1a1a`, `--card: #141414`
  - Text colors: `--text-primary: #f5f5f5`, `--text-secondary: #a0a0a0`, `--text-muted: #666666`
  - Borders: `--border: #222222`, `--border-hover: #333333`
  - Shadows profundas para dark mode (opacity 0.3-0.6)
  - Nuevas utilidades: `section-padding`, `section-padding-lg`, `animate-marquee`, `animate-float`, `animate-scale-in`, `fade-in-down-anim`
  - Body background: `var(--bg-primary)` (#0a0a0a)

- **14 UI Components** — Dark theme: `bg-[var(--card)]`, `bg-[var(--surface)]`, `text-[var(--text-primary)]`, `border-[var(--border)]`, semantic colors con `bg-*-500/10`

- **3 Layouts rediseñados**:
  - `DashboardLayout.tsx` — Sidebar fijo 260px, nav vertical con iconos, main content offset `lg:ml-64`
  - `AuthLayout.tsx` — Split layout: imagen gym izq + formulario der
  - `ClientLayout.tsx` — Premium header con logo accent-box, nav con iconos, cart badge

- **Landing** — Hero full-bleed `bg-black/60`, headline `font-heading text-8xl`, features alternados, pricing 3 tiers (dark Pro card), CTA `bg-gray-900`

- **SaaSLanding** — Hero center-aligned con dashboard mockup, feature grid, pricing prominently

- **6 Admin Pages**:
  - `Dashboard.tsx` — KPIs gigantes `font-heading text-4xl font-black`, AreaChart con gradient, quick actions
  - `Users.tsx` — Card grid 3 cols, avatar 56px, role badges, filter pills
  - `Inventory.tsx` — Product card grid con imagen hover zoom, category pills, view toggle
  - `Exercises.tsx` — Muscle group cards h-40 imagen, hover scale-110
  - `RoutineBuilder.tsx` — Two-column: day tabs + library sidebar
  - `RoutineLibrary.tsx` — Template cards con accent icon

- **5 Shop Pages**:
  - `Catalog.tsx` — font-heading title, category pills, ProductCard grid
  - `Cart.tsx` — Two-column: items + sticky summary
  - `Checkout.tsx` — 3-circle step indicator, credit card visual, confetti success
  - `ProductDetail.tsx` — Gallery rounded-3xl, huge price, trust badges, nutrition table
  - `ProductCard.tsx` — Hover zoom, slide-up add-to-cart button

- **Client Pages**: `MyRoutines.tsx` — Calendar rounded-2xl, font-heading day names
- **Auth Pages (5)** — font-heading titles, error boxes `bg-red-500/10 border-red-500/30`
- **PlatformSettings** — Cards rounded-2xl, accent toggles

- **Build**: `tsc --noEmit` ✅ | `vite build` ✅ (814ms)

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
