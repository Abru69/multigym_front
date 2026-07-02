# Próximos Pasos

**Última sesión:** 2026-07-02 — Admin redesign completado

## Prioridad Alta

1. **Fix Lint Errors (107)**
   - `react-refresh/only-export-components` — Considerar agregar `/* eslint-disable */` temporalmente o mover exports
   - `@typescript-eslint/no-unused-vars` — Eliminar imports/variables no usadas
   - `jsx-a11y` — Agregar aria-labels y keyboard handlers

2. **Tests Unitarios**
   - Configurar Vitest o Jest
   - Tests para stores (authStore, cartStore, routineStore)
   - Tests para componentes UI (Modal, Toast, ConfirmDialog)

## Prioridad Media

3. **Performance Optimization**
   - Agregar `React.memo()` donde sea necesario
   - Evaluar `useMemo` en listas grandes (Inventory, Users)
   - Lazy loading de imágenes con `loading="lazy"`

4. **Integración API Backend**
   - Conectar endpoints reales
   - Manejo de errores de red
   - Loading states para cada operación CRUD

5. **PWA Setup**
   - Service worker
   - Manifest
   - Offline support básico

## Prioridad Baja

6. **Documentación de API**
   - Swagger/OpenAPI del backend
   - Endpoints disponibles

7. **Accesibilidad (a11y)**
   - Auditoría completa
   - Focus management
   - Screen reader testing

8. **Internacionalización (i18n)**
   - Soporte multi-idioma

## Bloqueado

- (Ninguno en este momento)
