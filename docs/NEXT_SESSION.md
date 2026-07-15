# Próximos Pasos

**Última sesión:** 2026-07-14 — API Improvements, Tenant Banners, Validation Hardening

## Completado Reciente

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

1. **Crear endpoints de Progress** — Necesario para que Progress.tsx deje de usar mock data
2. **Crear endpoints de Nutrition backend** — Frontend ya usa `getMyNutritionPlan()`, falta implementar `/api/nutricion/my` en Java
3. **Integrar creación de miembros** — Formulario que combine User + Member
4. **Verificar UI en navegador** — Ejecutar `npm run dev` y probar TenantBanner, Login redirect, Cart badge

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

9. **PWA Setup**
   - Service worker, manifest, offline support

## Bloqueado

- **Audit Logs backend 500** — `GET /api/audits` retorna 500. Frontend listo, pendiente fix en backend
- **Progress.tsx** — sin endpoints backend, se queda como mock data hasta que se cree el controlador Java

## Pendiente Medio

- **Exportar CSV** en Audit Logs — Botón existe en UI pero aún no implementado
- **Fix Lint Errors (121)** — preexistentes: react-refresh, no-unused-vars, jsx-a11y
