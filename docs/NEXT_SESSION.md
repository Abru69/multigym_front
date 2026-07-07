# Próximos Pasos

**Última sesión:** 2026-07-07 — Delivery Methods (Checkout, Pickups, Shipments, Settings)

## Completado Reciente

- ✅ **Delivery Methods** — Checkout 3 pasos, Pickups admin, Shipments admin, DeliverySettings
- ✅ **Checkout redesign** — Selección de método (recogida/envío), sucursal o dirección
- ✅ **MyOrders** — Badge de método, filtro por tipo, muestra sucursal o dirección
- ✅ **Pickups.tsx** — Vista admin pedidos recogida, "Marcar Listo" action
- ✅ **Shipments.tsx** — Vista admin envíos con dirección de entrega
- ✅ **DeliverySettings.tsx** — Toggle habilitar/deshabilitar por tenant
- ✅ **Admin nav** — Recogidas, Envíos, Métodos de Entrega en sidebar

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

### 2. Nutrition.tsx — Plan de nutrición

**Necesita:** `NutritionController` completo nuevo

El frontend muestra: macros diarios (calorías, proteína, carbohidratos, grasas), plan de comidas (4 comidas), seguimiento de agua.

**DTOs necesarios:**
```java
public record NutritionPlanDTO(
    UUID id,
    UUID memberId,
    Integer targetCalories,
    Integer targetProtein,
    Integer targetCarbs,
    Integer targetFats,
    List<MealDTO> meals,
    String notes
) {}

public record MealDTO(
    UUID id,
    String name,          // "Desayuno", "Comida", etc.
    List<FoodItemDTO> foods,
    Integer calories,
    Integer protein,
    Integer carbs,
    Integer fats
) {}
```

**Endpoints necesarios:**
- `GET /api/nutrition/member/{memberId}` — plan de nutrición del miembro
- `POST /api/nutrition` — crear plan
- `PUT /api/nutrition/{id}` — actualizar plan
- `DELETE /api/nutrition/{id}` — eliminar plan
- `POST /api/nutrition/{planId}/meals` — agregar comida
- `PUT /api/nutrition/meals/{mealId}` — actualizar comida

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
2. **Crear endpoints de Nutrition** — Necesario para que Nutrition.tsx deje de usar mock data
3. **Integrar creación de miembros** — Formulario que combine User + Member
4. **Verificar UI en navegador** — Ejecutar `npm run dev` y probar las 4 páginas nuevas

## Prioridad Media

5. **Fix Lint Errors (132)**
   - `react-refresh/only-export-components`
   - `@typescript-eslint/no-unused-vars`
   - `jsx-a11y`

6. **Performance Optimization**
   - `React.memo()` donde sea necesario
   - `useMemo` en listas grandes
   - Lazy loading de imágenes

## Prioridad Baja

7. **Tests Unitarios**
   - Vitest o Jest
   - Tests para stores y componentes UI

8. **PWA Setup**
   - Service worker, manifest, offline support

## Bloqueado

- **Audit Logs backend 500** — `GET /api/audits` retorna 500. Frontend listo, pendiente fix en backend (AuditLog entity mapping, null checks en `auditService.findFiltered`)
- Progress.tsx y Nutrition.tsx — sin endpoints backend, se quedan como mock data hasta que se creen los controladores Java

## Pendiente Medio

- **Exportar CSV** en Audit Logs — Botón existe en UI pero aún no implementado
- **Fix Lint Errors (121)** — preexistentes: react-refresh, no-unused-vars, jsx-a11y
