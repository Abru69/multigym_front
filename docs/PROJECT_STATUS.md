# Estado del Proyecto

**Última actualización:** 2026-07-19

## Sesión Actual — Navbar Y Temas

- ✅ Navbar administrativo agrupado por secciones en `AdminLayout.tsx`.
- ✅ Secciones del navbar contraíbles y desplegables en desktop y móvil.
- ✅ Elementos del navbar filtrados por permisos; las secciones vacías se ocultan.
- ✅ Contraste corregido para elemento activo y hover en tema claro.
- ✅ Variables semánticas para estados `success`, `warning`, `error` e `info`.
- ✅ Tooltips y gráficas administrativas adaptados a ambos temas.
- ✅ Colores fijos corregidos en tarjetas, tablas, badges, overlays, modales, envíos, recogidas, pagos y suscripciones.
- ✅ TypeScript, ESLint, build de producción y `git diff --check` pasan correctamente.
- ℹ️ No se realizaron cambios en el backend.

## Auditoría Frontend 2026-07-18

- ✅ Toast global montado en `App.tsx`.
- ✅ Logout de plataforma ya no envía el token de tenant a `/api/auth/logout`.
- ✅ Refresh token tenant integrado en `fetchApi()` con un único reintento.
- ✅ Perfil conectado a `PUT /api/tenant/users/{id}` y suscripciones usan `memberId`.
- ✅ ProductDetail procesa respuestas paginadas y consulta por nombre.
- ✅ Persistencia de nutrición y progreso de rutinas aislada por tenant y usuario.
- ✅ Cache PWA eliminado para respuestas API autenticadas.
- ✅ Errores de lint y accesibilidad corregidos.
- ⚠️ Cambio de contraseña requiere un endpoint backend documentado.
- ⚠️ Progreso físico todavía requiere página, ruta y endpoints backend.
- ⚠️ Logout server-side de plataforma requiere endpoint backend específico.

## Resumen

| Área               | Estado                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build              | ✅ Passing                                                                                                                                        |
| TypeScript         | ✅ Passing                                                                                                                                        |
| Lint               | ✅ Passing                                                                                                                                        |
| Themes             | ✅ Light/dark variables, contrast and status colors corrected                                                                                   |
| API Integration    | ✅ 30+ endpoints conectados + pagination                                                                                                         |
| Admin Pages        | ✅ 14 páginas (Dashboard, Inventario, Usuarios, Ejercicios, Planes, Suscripciones, Pagos, Nutrición, Recogidas, Envíos, Métodos de Entrega, ...) |
| Client Pages       | ✅ 4 páginas (Rutinas, Nutrición, Progreso, My Orders)                                                                                           |
| Checkout           | ✅ Integrado con backend + delivery methods (3 pasos)                                                                                            |
| Pickup Flow        | ✅ Estado READY, comprobante QR, entregado/cancelado                                                                                             |
| Nutrition (Admin)  | ✅ CRUD planes nutricionales + assignación a miembros                                                                                            |
| Nutrition (Client) | ✅ Conectado con store, fallback mock                                                                                                            |
| Roles & Permisos   | ✅ 6 roles con control de acceso por página                                                                                                      |
| Tenant Landing     | ✅ Banners promocionales + branding dinámico                                                                                                     |
| Form Validations   | ✅ Validación reforzada en todos los forms                                                                                                       |
| PWA                | ✅ Instalable + offline support + auto-update                                                                                                    |
| Missing Endpoints  | ⚠️ Progress sin backend                                                                                                                          |

## Funcionalidades Recientes (2026-07-14)

### PWA (Progressive Web App)

- `vite-plugin-pwa` con Workbox para service worker automático
- Manifest: nombre, descripción, iconos, theme-color, display standalone
- Iconos PWA: 192x192, 512x512, 512x512-maskable
- Workbox precache: todos los assets JS/CSS/HTML/fonts
- Runtime caching: Google Fonts (CacheFirst), API (NetworkFirst)
- `index.html`: fix favicon, +apple-touch-icon, +theme-color, +apple-mobile-web-app-capable
- Auto-update: service worker se actualiza automáticamente
- **Desktop**: Botón "Instalar app" en barra de direcciones
- **Mobile**: "Agregar a pantalla de inicio" en iOS/Android
- **Offline**: La app carga contenido cacheado sin conexión

### Tenant Landing — Banners Promocionales

- `TenantBanner.tsx` — componente de banner debajo del hero
- `TenantBranding.banners` array con imagen, título, subtítulo, link, botón, accentColor
- Ejemplo: gym1 tiene banner "Summer Challenge 2026"
- `TenantLandingPage.tsx` renderiza `<TenantBanner />` después de `<TenantHero />`

### API Refactoring

- `fetchApi()` separa requests platform vs tenant automáticamente
- Token de plataforma (`platform-auth`) para `/platform/` y `/platform-api/`
- Token de tenant (`auth-storage`) para `/api/tenant/` y `/api/auth/`
- 401 handling: redirige a `/platform/login` o `/login` según contexto
- Header `X-Tenant-ID` no se envía en requests de plataforma

### API Pagination

- `getProducts({ name?, page?, size? })` — búsqueda y paginación
- `getWorkouts({ title?, memberId?, page?, size? })` — búsqueda y paginación
- `getOrders({ status?, userId?, page?, size? })` — filtrado y paginación
- `getNutritionPlans({ search?, page?, size? })` — búsqueda y paginación

### Tenant Users CRUD

- `createTenantUser(data)` — POST `/api/tenant/users`
- `updateTenantUser(userId, data)` — PUT `/api/tenant/users/{id}`
- `toggleTenantUserStatus(userId)` — PATCH `/api/tenant/users/{id}/status`
- `deleteTenantUser(userId)` — DELETE `/api/tenant/users/{id}`

### RoutineBuilder Fix

- Crea workout con `createWorkout({ memberId, title, startsAt, endsAt })`
- Luego crea ejercicios con `createWorkoutExercise({ workoutId, exerciseId, ... })`
- `memberId` resuelto desde `user.memberDTO.id`
- `WorkoutExerciseRequest.dayOfWeek` cambiado a opcional

### Validaciones Reforzadas

- **Users**: nombre y teléfono requeridos, password minLength=8
- **NutritionPlans**: valida nombres de alimentos no vacíos
- **Subscriptions**: endDate debe ser posterior a startDate
- **Payments**: solo suscripciones ACTIVE en select, total solo COMPLETED/APPROVED
- **ActivateAccount**: minLength 6 → 8
- **Exercises**: valida nombre duplicado en grupos personalizados

### Login Redirect por Rol

- `getDefaultRoute(role)` mapea page → route (ej: `users` → `/admin/usuarios`)
- `Login.tsx`: useEffect auto-redirige si `isAuthenticated`
- `RoleGuard` y `PathRoleGuard` usan getDefaultRoute() para redirects

### Cart Tenant-Scoped

- localStorage key: `reto4-cart-{tenantId}` (antes genérico)
- Cart badge muestra número de items

### Other Fixes

- **MemberNav**: `/app/nutricion` → `/app/perfil`
- **MyOrders**: paymentStatus labels en español
- **Checkout**: tipado `OrderRequest`, fallback `dto || lista`
- **RoutineStore**: `Promise.allSettled` carga paralela
- **Platform Auth**: async logout con backend
- **CSS**: `color-scheme: inherit`

## Funcionalidades Recientes (2026-07-07)

### My Orders (`/app/mis-ordenes`)

- Endpoint: `GET /api/orders/my` (filtra por JWT user)
- Sort por fecha (default: recientes primero) y por total
- Summary cards: total, completadas, gastado
- Cards expandibles con items, payment method, referencia
- Empty state con link a tienda

### Checkout

- Flujo 3 pasos: método de entrega → detalles → pago
- Recogida: selector de sucursal, sin costo de envío
- Envío: formulario dirección, envío gratis >$1500, $150 si no
- Envía `deliveryMethod`, `branchId` o `shippingAddress/City/PostalCode`

### Delivery Methods (Admin)

- **Recogidas** (`/admin/recogidas`): lista pedidos PICKUP, "Marcar Listo" para cambiar a COMPLETED
- **Envíos** (`/admin/envios`): lista pedidos SHIPPING con dirección de entrega
- **Métodos de Entrega** (`/admin/entrega`): toggle habilitar/deshabilitar recogida y envío por tenant

### Image Mapping

- `imageUrl`/`videoUrl` de ProductDTO mapeados a `image`/`video`
- Fallback: `p.imageUrl || p.image` en Catalog, Detail, Inventory

## Paleta De Colores

| Token              | Valor     | Uso                  |
| ------------------ | --------- | -------------------- |
| `--bg-primary`     | `#0a0a0a` | Fondo principal      |
| `--bg-secondary`   | `#111111` | Fondo body           |
| `--card`           | `#141414` | Tarjetas, paneles    |
| `--surface`        | `#1a1a1a` | Superficies elevadas |
| `--border`         | `#222222` | Bordes sutiles       |
| `--text-primary`   | `#f5f5f5` | Texto principal      |
| `--text-secondary` | `#a0a0a0` | Texto secundario     |
| `--text-muted`     | `#666666` | Texto apagado        |
| `--accent`         | `#f97316` | Acento              |
| `--accent-text`    | Según tema | Texto sobre accent   |
| `--success-muted`  | Según tema | Fondo tenue de éxito |
| `--warning-muted`  | Según tema | Fondo tenue de aviso |
| `--error-muted-bg` | Según tema | Fondo tenue de error |
| `--info-muted`     | Según tema | Fondo tenue de info  |

## Completado

### Fase 1 — Limpieza de Tipos

- `types/api.ts` con ResponseDTO, UserDTO, LoginResponse, DashboardDTO, ProductDTO, ExerciseDTO, WorkoutDTO
- Eliminado `App.tsx` innecesario y carpetas vacías

### Fase 2 — Design System

- Modal, Select, Textarea, Skeleton, Spinner, Avatar, DropdownMenu, Toast + ToastContainer

### Fase 3 — Lazy Loading

- `React.lazy()` en todas las rutas
- Suspense con Spinner
- Página 404 NotFound

### Fase 4 — Layouts Compartidos

- DashboardLayout reutilizado por AdminLayout y PlatformLayout
- ~90% reducción de duplicación

### Fase 5 — Landing Page

- Hero, RoutineShowcase, Features, Pricing, Footer
- Sticky header con ThemeToggle

### Fase 6 — Admin Redesign (Complete)

- Componentes compartidos: AdminHeader, SearchBar, EmptyState, LoadingState, FormField, ConfirmDialog
- Hook: useDebounce
- Páginas rediseñadas:
  - Dashboard.tsx ✅
  - Users.tsx ✅
  - Inventory.tsx ✅
  - Exercises.tsx ✅
  - RoutineBuilder.tsx ✅
  - RoutineLibrary.tsx ✅
- CSS files eliminados: Dashboard.css, Users.css, Inventory.css, Exercises.css, RoutineBuilder.css, AdminShared.css

### Fase 7 — CSS Migration

- Todos los imports de CSS eliminados
- Estilos Tailwind en todas las páginas
- AuthShared.css migrado a Tailwind inline

### Fase 8 — Platform Integration

- **Platform Dashboard** integrado con `GET /api/tenants`
- **Platform Dashboard** usa `GET /api/tenants/summary` para métricas reales: MRR, miembros, retención y trials
- **Platform Dashboard** calcula distribución real de planes con `GET /api/tenants` + `GET /api/saas-plans`
- **Platform Tenants** integrado con:
  - `GET /api/tenants` — listar tenants
  - Métricas enriquecidas por tenant: `memberCount`, `memberLimit`, `planPrice`, `isTrial`
  - `GET /api/saas-plans` — resolver nombres de planes
  - `POST /api/tenants` — crear tenant con `planId`
  - `PATCH /api/tenants/{tenantId}/status` — toggle estado
  - `DELETE /api/tenants/{tenantId}` — eliminar con ConfirmDialog
- Store: `platformDashboardStore.ts`, `platformTenantsStore.ts`
- Tipos actualizados: `TenantDTO` (+planId, trialEndsAt), `SaasPlanDTO`, `TenantRequestDTO`

### Fase 9 — Rediseño Total + Dark Theme (2026-07-06)

- **Dark Theme Near-Black** aplicado a todo el frontend
- **37 archivos modificados** con ~439 reemplazos de colores hardcoded
- **Landing Page** — Hero full-bleed con imagen gym, headline huge, pricing 3 tiers, CTA dark
- **SaaSLanding** — Hero center-aligned con dashboard mockup, feature grid, pricing
- **DashboardLayout** — Sidebar fijo 260px con nav vertical, main content offset
- **AuthLayout** — Split layout: imagen gym izq + formulario der
- **ClientLayout** — Premium header con logo accent-box, nav con iconos
- **Dashboard** — KPIs gigantes, AreaChart con gradient, quick actions, activity feed
- **Users** — Card grid 3 cols (sin DataTable), avatar grande, filter pills
- **Inventory** — Product card grid con imagen hover zoom, category pills
- **Exercises** — Muscle group cards con imagen, hover scale
- **RoutineBuilder** — Two-column: day tabs + exercise library sidebar
- **RoutineLibrary** — Template cards con accent icon
- **Catalog** — font-heading title, category pills, ProductCard grid
- **Cart** — Two-column: items + sticky summary
- **Checkout** — 3-circle step indicator, credit card visual, confetti success
- **ProductDetail** — Gallery rounded-3xl, huge price, nutrition table
- **ProductCard** — Hover zoom, slide-up add-to-cart button
- **MyRoutines** — Calendar rounded-2xl, font-heading day names
- **Auth (5)** — font-heading titles, dark error boxes
- **PlatformSettings** — Cards rounded-2xl, accent toggles
- **14 UI Components** — Dark theme aplicado

### Fase 10 — Conexión de 30 Endpoints (2026-07-06)

### Fase 11 — Audit Logs + Toggles de Estado (2026-07-07)

- **Audit Logs**: `getAudits()` con 5 filtros + paginación, `platformLogsStore.ts`, `PlatformLogs.tsx` con timeline
- **Dashboard Actividad Reciente**: consume `GET /api/audits?size=6` (eliminó mock data)
- **Toggle rápido**: badge click en Gimnasios y Usuarios para activar/suspendir
- **Fix dropdowns**: z-index, overflow-hidden, stopPropagation, type="button"
- **Sort alfabético** en tabla de Gimnasios
- **⚠️ Backend**: `GET /api/audits` retorna 500 (pendiente fix backend)

- **Types**: +12 DTO/Request types — MemberListItemDTO, PlanListItemDTO, SubscriptionListItemDTO, PaymentListItemDTO, WorkoutExerciseListItemDTO, WorkoutLogListItemDTO + 6 Request types
- **API**: +17 funciones — Members (5), Plans (6), Subscriptions (4), Payments (3), WorkoutExercises (4), WorkoutLogs (3)
- **4 páginas admin creadas**:
  - `Members.tsx` — GET/PUT/DELETE /api/members
  - `Plans.tsx` — GET/POST/PUT/DELETE/PATCH /api/plans
  - `Subscriptions.tsx` — GET/POST/PATCH /api/subscriptions
  - `Payments.tsx` — GET/POST /api/payments
- **routineStore.ts**: `loadRoutines()` llama `GET /api/workouts` + `GET /api/workout-exercises/{id}` (fallback a mockRoutines si falla)
- **Checkout.tsx**: `handleSimulatePayment` crea orden real via `POST /api/orders` + `POST /api/payments`
- **AdminLayout.tsx**: +4 nav items (Miembros, Planes, Suscripciones, Pagos)
- **Router**: +4 lazy routes bajo `/admin/`
- Build: `tsc --noEmit` ✅ | `vite build` ✅ (1.76s)

### Fase 12 — Nutrition Module Frontend (2026-07-13)

- **Types**: `NutritionPlanDTO`, `MealDTO`, `FoodItemDTO`, `NutritionPlanRequest`, `MealRequest`, `FoodItemRequest`
- **API**: 6 funciones — `getNutritionPlans`, `getNutritionPlanByMember`, `createNutritionPlan`, `updateNutritionPlan`, `deleteNutritionPlan`, `assignNutritionPlan`
- **Store**: `nutritionStore.ts` — Zustand con persist para `mealCompletion` y `waterGlasses`
- **Admin**: `NutritionPlans.tsx` — CRUD completo con card grid, editor de comidas (select predefinido), editor de alimentos con macros, assignación a miembro
- **Ruta**: `/admin/nutricion` + nav item "Nutrición" en AdminLayout
- **Cliente**: `Nutrition.tsx` conectado con `nutritionStore`, fallback a mock data
- **Fix**: `exercise.ts` syntax error pre-existente
- Build: `vite build` ✅ (739ms)

### Fase 13 — Roles y Permisos por Página (2026-07-13)

- **Types**: `UserRole` type expandido en `user.ts` con 6 valores: admin, client, nutricionist, staff, receptionist, seller
- **`permissions.ts`**: Mapa de permisos por rol, `canAccessPage()`, `getAllowedPages()`, `ROLE_LABELS`, `ROLE_COLORS`, `getPageFromPath()`
- **`RoleGuard.tsx`**: Guard genérico por ruta + `PathRoleGuard` por pathname
- **AdminGuard**: Usa `getAllowedPages()` en vez de `role === 'admin'` hardcodeado
- **Router**: Cada ruta admin envuelta con `RoleGuard page="..."`
- **AdminLayout**: Nav items filtrados por `canAccessPage()`
- **Users.tsx**: Select de 6 roles + badges con colores por rol
- **Login/ClientLayout/Landing/TenantHero**: Redirect y portal link usan `getAllowedPages()`
- **Acceso por rol**: Admin (todas), Nutriólogo (nutrición), Staff (dashboard/usuarios/inventario/ejercicios), Recepcionista (dashboard/usuarios/suscripciones/pagos), Vendedor (dashboard/inventario/recogidas/envíos/entrega), Cliente (portal cliente)
- Build: `vite build` ✅ (836ms)

### Fase 14 — API Improvements + Tenant Banners + Validation Hardening (2026-07-14)

- **API refactoring**: `fetchApi()` separa platform vs tenant, mejor manejo de 401
- **API pagination**: 4 endpoints con params de paginación y búsqueda
- **Tenant Users CRUD**: create, update, toggleStatus, delete
- **Tenant Landing**: `TenantBanner.tsx` con banners promocionales
- **RoutineBuilder fix**: Crea workout + ejercicios secuencialmente
- **Validaciones reforzadas**: 6 páginas con mejoras de validación
- **Login redirect**: `getDefaultRoute()` por rol + useEffect auto-redirect
- **Cart tenant-scoped**: localStorage key con tenantId
- **Cart badge**: Muestra número de items
- **Types**: `ProductRequest`, `TenantUserRequest`
- Build: `vite build` ✅ (836ms)

## Endpoints Faltantes en Backend

### Progress.tsx — Datos físicos del usuario

**El frontend muestra:** peso, % grasa corporal, medidas corporales (pecho, cintura, cadera, brazos, piernas)

**El backend `WorkoutLogDTO` solo tiene:** `durationMinutes`, `caloriesBurned`, `completedAt`

**Campos necesarios en el DTO:**

```java
public record ProgressDTO(
    UUID id, UUID memberId, LocalDate date,
    BigDecimal weight, BigDecimal bodyFat,
    Integer chest, Integer waist, Integer hips, Integer arms, Integer legs,
    String notes
) {}
```

**Endpoints necesarios:**

- `GET /api/progress/member/{memberId}` — listar progreso
- `POST /api/progress` — registrar dato físico
- `PUT /api/progress/{id}` — editar registro
- `DELETE /api/progress/{id}` — eliminar registro

### Nutrition — Frontend listo, endpoints pendientes

**Frontend completado:** Admin CRUD + cliente conectado con store. Fallback a mock data mientras el backend no exista.

**Endpoints necesarios (para cuando el backend esté listo):**

- `GET /api/nutrition/member/{memberId}` — plan de nutrición del miembro
- `GET /api/nutrition` — listar todos los planes (admin)
- `POST /api/nutrition` — crear plan
- `PUT /api/nutrition/{id}` — actualizar plan
- `DELETE /api/nutrition/{id}` — eliminar plan
- `PATCH /api/nutrition/{id}/assign` — asignar plan a miembro

### Miembro Creación — Formulario completo

**Problema:** `POST /api/members` requiere un `userId` existente. Necesita integrar creación de User + Member en un solo flujo.

## Pendiente

### Lint Issues

- `react-refresh/only-export-components` — lazy imports (pre-existente)
- `@typescript-eslint/no-unused-vars` — variables no usadas
- `jsx-a11y` — accesibilidad en algunos componentes UI

### Mejoras Futuras

- Tests unitarios
- Integración completa con API backend (módulos restantes)
- Performance optimization (memo, useMemo where needed)
- PWA setup

## Bugs Conocidos

- Cambio de contraseña del cliente pendiente de endpoint backend.
- Progreso físico pendiente de implementación frontend y backend.
- El contrato de nutrición debe unificarse entre `/api/nutrition/my` y `/api/nutrition/member/{memberId}`.

## Archivos CSS Eliminados

```
src/features/admin/pages/styles/
├── AdminShared.css
├── Dashboard.css
├── Exercises.css
├── Inventory.css
├── RoutineBuilder.css
└── Users.css

src/features/auth/pages/styles/
└── AuthShared.css
```
