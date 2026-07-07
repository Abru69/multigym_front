# Estado del Proyecto

**Última actualización:** 2026-07-07

## Resumen

| Área               | Estado                                    |
| ------------------ | ----------------------------------------- |
| Build              | ✅ Passing (517ms)                        |
| TypeScript         | ✅ Clean                                  |
| Lint               | ⚠️ Problemas preexistentes               |
| Dark Theme         | ✅ Near-black (#0a0a0a) + accent #aaff00 |
| API Integration    | ✅ 30+ endpoints conectados               |
| Admin Pages        | ✅ 13 páginas (Dashboard, Inventario, Usuarios, Ejercicios, Miembros, Planes, Suscripciones, Pagos, Recogidas, Envíos, Métodos de Entrega, ...) |
| Client Pages       | ✅ 4 páginas (Rutinas, Nutrición, Progreso, My Orders) |
| Checkout           | ✅ Integrado con backend + delivery methods (3 pasos)|
| Pickup Flow        | ✅ Estado READY, comprobante QR, entregado/cancelado |
| Missing Endpoints  | ⚠️ Progress y Nutrition sin backend       |

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

## Paleta de Colores (Dark Theme)

| Token          | Valor     | Uso                    |
| -------------- | --------- | ---------------------- |
| `--bg-primary` | `#0a0a0a` | Fondo principal        |
| `--bg-secondary`| `#111111`| Fondo body             |
| `--card`       | `#141414` | Tarjetas, paneles      |
| `--surface`    | `#1a1a1a` | Superficies elevadas   |
| `--border`     | `#222222` | Bordes sutiles         |
| `--text-primary`| `#f5f5f5`| Texto principal        |
| `--text-secondary`| `#a0a0a0`| Texto secundario     |
| `--text-muted` | `#666666` | Texto apagado          |
| `--accent`     | `#aaff00` | Verde neón             |
| `--accent-text`| `#0a0a0a` | Texto sobre accent     |

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

### Nutrition.tsx — Plan de nutrición

**El frontend muestra:** macros diarios, plan de comidas (4 comidas), seguimiento de agua

**Necesita:** `NutritionController` completo nuevo con `NutritionPlanDTO`, `MealDTO`, `FoodItemDTO`

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

- (Ninguno crítico en este momento)

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
