# Próximos Pasos

**Última sesión:** 2026-07-15 — Mercado Pago Checkout Sandbox + Webhooks

## Completado Reciente

- ✅ **PWA completa** — `vite-plugin-pwa` + Workbox, offline support, auto-update, iconos generados
- ✅ **Tenant Landing Banners** — `TenantBanner.tsx` con banners promocionales debajo del hero
- ✅ **API refactoring** — `fetchApi` separa platform vs tenant, mejor manejo de 401
- ✅ **API pagination** — `getProducts`, `getWorkouts`, `getOrders`, `getNutritionPlans` con params
- ✅ **Tenant Users CRUD** — create, update, toggleStatus, delete
- ✅ **Nutrition simplificado** — `getMyNutritionPlan()` (sin memberId)
- ✅ **RoutineBuilder fix** — Crea workout + ejercicios secuencialmente
- ✅ **Validaciones mejoradas** — Users, NutritionPlans, Subscriptions, Payments, ActivateAccount
- ✅ **Login redirect por rol** — `getDefaultRoute()` + useEffect auto-redirect
- ✅ **AdminGuard/RoleGuard** — getDefaultRoute() para redirects por rol
- ✅ **Cart tenant-scoped** — localStorage key con tenantId
- ✅ **Cart badge** — Muestra número de items
- ✅ **Roles y Permisos** — 6 roles con control de acceso por página
- ✅ **Mercado Pago Checkout** — tokenización con `@mercadopago/sdk-js`, envío de `cardToken` a `/api/orders`, y datos sandbox MLM precargados en modo `TEST-*`
- ✅ **Mercado Pago Sandbox Scenarios** — `APRO`, `OTHE`, `CONT`, `CALL`, `FUND`, `SECU`, `EXPI`, `FORM` probados contra backend local
- ✅ **Mercado Pago Webhooks** — backend recibe `payment` notifications con `notification_url`; historial MercadoPago con entregas exitosas

## Endpoints Faltantes en Backend (Mock Data en Frontend)

### 1. Progress.tsx — Datos físicos del usuario

**Necesita:** `GET /api/progress/{memberId}` o `GET /api/workout-logs/{workoutId}` extendido

El frontend muestra: peso, % grasa corporal, medidas corporales (pecho, cintura, cadera, brazos, piernas).
El backend actual `WorkoutLogDTO` solo tiene: `durationMinutes`, `caloriesBurned`, `completedAt`.

**Campos necesarios en el DTO:**
```java
public record ProgressDTO(
    UUID id,
    UUID memberId,
    LocalDate date,
    BigDecimal weight,
    BigDecimal bodyFat,
    Integer chest,    // cm
    Integer waist,    // cm
    Integer hips,     // cm
    Integer arms,     // cm
    Integer legs,     // cm
    String notes
) {}
```

**Endpoints necesarios:**
- `GET /api/progress/member/{memberId}` — listar progreso de un miembro
- `POST /api/progress` — registrar nuevo dato físico
- `PUT /api/progress/{id}` — editar registro
- `DELETE /api/progress/{id}` — eliminar registro

### 2. Nutrition — Frontend listo, endpoints pendientes

**Frontend completado:** Admin CRUD + cliente con store. Fallback a mock data.

**Endpoints necesarios (para cuando el backend esté listo):**
- `GET /api/nutrition/member/{memberId}` — plan de nutrición del miembro
- `GET /api/nutrition` — listar todos los planes (admin)
- `POST /api/nutrition` — crear plan
- `PUT /api/nutrition/{id}` — actualizar plan
- `DELETE /api/nutrition/{id}` — eliminar plan
- `PATCH /api/nutrition/{id}/assign` — asignar plan a miembro

### 3. Miembro Creación — Formulario completo

**Problema:** Members.tsx solo tiene lectura/edición, no creación.

El backend `POST /api/members` requiere un `userId` existente. Para crear un miembro completo se necesita:
1. Primero: `POST /api/tenant/users` → obtener userId
2. Luego: `POST /api/members` con ese userId

**Necesita:** Integrar el formulario de Users.tsx con la creación de miembros, o crear un flujo de "Crear Miembro" que combine ambos pasos.

### 4. Subscription por Miembro — Perfil de miembro

**Endpoint existe:** `GET /api/subscriptions/member/{memberId}`

**Falta:** Página de detalle de miembro que muestre:
- Datos personales
- Suscripción activa
- Historial de pagos
- Rutina asignada

### 5. Payment por Suscripción — Historial de pagos

**Endpoint existe:** `GET /api/payments/subscription/{subscriptionId}`

**Falta:** Vista de detalle de suscripción que muestre:
- Historial de pagos de esa suscripción
- Estado de la suscripción
- Fechas de inicio/fin

## Prioridad Alta

1. **Decidir soporte de pagos pendientes Mercado Pago (`CONT`)** — hoy el backend devuelve `402`; si se requiere, crear orden con `paymentStatus=PENDING` y actualizar por webhook
2. **Crear endpoints de Progress** — Necesario para que Progress.tsx deje de usar mock data
3. **Integrar creación de miembros** — Formulario que combine User + Member
4. **Verificar UI en navegador** — Ejecutar `npm run dev` y probar flujo checkout completo

## Mercado Pago Local Test Setup

- Frontend HTTPS: `https://localhost:5173`
- Backend local: `http://localhost:8080`
- Docker solo para Postgres/Redis durante desarrollo local
- Frontend env: `VITE_MP_PUBLIC_KEY=TEST-...`
- Backend env: `MP_ACCESS_TOKEN=TEST-...`, `MP_PUBLIC_KEY=TEST-...`, `MP_NOTIFICATION_URL=https://connector-overlook-bucket.ngrok-free.dev/api/webhooks/mercadopago`
- Ngrok static domain: use the project ngrok account and run `ngrok http --domain=connector-overlook-bucket.ngrok-free.dev 8080`; do not use random ngrok URLs for Mercado Pago tests.
- Webhooks are backend-owned. Frontend only needs HTTPS local for Mercado Pago card tokenization.
- Tenant de prueba: `gymx`
- Usuario cliente: `client@gymx.com` / `admin123`
- Tarjeta MLM aprobada: Visa `4075 5957 1648 3764`, CVV `123`, vencimiento `11/30`, titular `APRO`

## Prioridad Media

5. **Fix Lint Errors (132)**
   - `react-refresh/only-export-components`
   - `@typescript-eslint/no-unused-vars`
   - `jsx-a11y`

6. **Performance Optimization**
   - `React.memo()` donde sea necesario
   - `useMemo` en listas grandes
   - Lazy loading de imágenes

7. **Tenant Branding — Banners dinámicos desde backend**
   - Actualmente hardcodeados en `tenantConfig.ts`
   - Necesita endpoint `GET /api/tenant-settings` para banners

## Prioridad Baja

8. **Tests Unitarios**
   - Vitest o Jest
   - Tests para stores y componentes UI

## Bloqueado

- **Audit Logs backend 500** — `GET /api/audits` retorna 500. Frontend listo, pendiente fix en backend
- **Progress.tsx** — sin endpoints backend, se queda como mock data hasta que se cree el controlador Java

## Pendiente Medio

- **Exportar CSV** en Audit Logs — Botón existe en UI pero aún no implementado
- **Fix Lint Errors (121)** — preexistentes: react-refresh, no-unused-vars, jsx-a11y
