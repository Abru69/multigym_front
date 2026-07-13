# Backend Specs — Cambios Necesarios

**Fecha:** 2026-07-13
**Frontend:** multigym_front

---

## 1. Roles (6 valores)

El frontend envía y espera los siguientes roles:

| Valor backend | Frontend normaliza a | Páginas admin |
|---------------|---------------------|---------------|
| `ADMIN` | `admin` | Todas (11) |
| `CLIENT` | `client` | Portal cliente |
| `NUTRICIONIST` | `nutricionist` | Nutrición |
| `STAFF` | `staff` | Dashboard, Usuarios, Inventario, Ejercicios |
| `RECEPTIONIST` | `receptionist` | Dashboard, Usuarios, Suscripciones, Pagos |
| `SELLER` | `seller` | Dashboard, Inventario, Recogidas, Envíos, Métodos de Entrega |

### Cambios necesarios

- **User entity**: Campo `role` debe aceptar los 6 valores
  - Si es enum Java: agregar `NUTRICIONIST`, `STAFF`, `RECEPTIONIST`, `SELLER`
  - Si es String: no hay que cambiar nada
- **JWT payload**: `role` debe contener el valor real del usuario
- **POST /api/auth/login**: Retornar el role real del usuario en `dto.role`
- **POST /api/tenant/users**: Aceptar los 6 valores en campo `role`
- **PUT /api/tenant/users/{id}**: Aceptar los 6 valores en campo `role`

### Si el role es enum:

```java
public enum TenantUserRole {
    ADMIN, CLIENT, NUTRICIONIST, STAFF, RECEPTIONIST, SELLER
}
```

---

## 2. Nutrition Endpoints (Nuevos)

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/nutrition/member/{memberId}` | Plan nutricional de un miembro |
| `GET` | `/api/nutrition` | Listar todos los planes (admin), `?page=&size=&search=` |
| `POST` | `/api/nutrition` | Crear plan |
| `PUT` | `/api/nutrition/{id}` | Actualizar plan |
| `DELETE` | `/api/nutrition/{id}` | Eliminar plan |
| `PATCH` | `/api/nutrition/{id}/assign` | Asignar plan a miembro |

### DTOs

```java
public record NutritionPlanDTO(
    UUID id,
    UUID memberId,
    String memberName,
    String name,
    Integer targetCalories,
    Integer targetProtein,
    Integer targetCarbs,
    Integer targetFats,
    List<MealDTO> meals,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}

public record MealDTO(
    UUID id,
    String name,          // "Desayuno", "Snack AM", "Comida", "Snack PM", "Cena", "Pre-entreno", "Post-entreno"
    String time,          // "07:30", "11:00", etc.
    List<FoodItemDTO> foods,
    Integer calories,
    Integer protein,
    Integer carbs,
    Integer fats
) {}

public record FoodItemDTO(
    UUID id,
    String name,          // "Pechuga de pollo", "Arroz integral", etc.
    String quantity,      // "200g", "1.5 tazas", etc.
    Integer calories,
    Integer protein,
    Integer carbs,
    Integer fats
) {}

// Request
public record NutritionPlanRequest(
    UUID memberId,
    String name,
    Integer targetCalories,
    Integer targetProtein,
    Integer targetCarbs,
    Integer targetFats,
    List<MealRequest> meals,
    String notes
) {}

public record MealRequest(
    String name,
    String time,
    List<FoodItemRequest> foods
) {}

public record FoodItemRequest(
    String name,
    String quantity,
    Integer calories,
    Integer protein,
    Integer carbs,
    Integer fats
) {}
```

### Tablas SQL

```sql
CREATE TABLE nutrition_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES member(id),
    name VARCHAR(100) NOT NULL,
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fats INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nutrition_plan_id UUID NOT NULL REFERENCES nutrition_plan(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    time VARCHAR(5),
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE food_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES meal(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50),
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    sort_order INTEGER DEFAULT 0
);
```

---

## 3. Progress Endpoints (Pendiente — futuro)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/progress/member/{memberId}` | Progreso físico del miembro |
| `POST` | `/api/progress` | Registrar dato físico |
| `PUT` | `/api/progress/{id}` | Editar registro |
| `DELETE` | `/api/progress/{id}` | Eliminar registro |

### Progress DTO

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
