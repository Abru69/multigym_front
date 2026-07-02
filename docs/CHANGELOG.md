# Changelog

Formato: [YYYY-MM-DD]

---

## [2026-07-02]

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
