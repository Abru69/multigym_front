# Próximos Pasos

**Última sesión:** 2026-07-02 — Platform Users integrado con backend

## Completado Reciente

- ✅ Platform Dashboard — datos reales con `GET /api/tenants`
- ✅ Platform Tenants — CRUD completo con backend (listar, crear, toggle status, eliminar)
- ✅ Platform Users — CRUD completo con backend (listar, crear, editar, toggle status, eliminar)
- ✅ SaaS Plans — resolución de planes desde `GET /api/saas-plans`

## Prioridad Alta

1. **Fix Lint Errors (132)**
   - `react-refresh/only-export-components` — Considerar agregar `/* eslint-disable */` temporalmente o mover exports
   - `@typescript-eslint/no-unused-vars` — Eliminar imports/variables no usadas
   - `jsx-a11y` — Agregar aria-labels y keyboard handlers

2. **Tests Unitarios**
   - Configurar Vitest o Jest
   - Tests para stores (authStore, cartStore, routineStore, platformTenantsStore, platformUsersStore)
   - Tests para componentes UI (Modal, Toast, ConfirmDialog)

## Prioridad Media

3. **Integración API Backend — Módulos Restantes**
   - Platform Billing — conectar con datos reales
   - Platform Logs — conectar con datos reales
   - Admin Users — CRUD con backend
   - Admin Inventory — CRUD con backend
   - Client Routines — conectar con backend

4. **Performance Optimization**
   - Agregar `React.memo()` donde sea necesario
   - Evaluar `useMemo` en listas grandes (Inventory, Users)
   - Lazy loading de imágenes con `loading="lazy"`

5. **PWA Setup**
   - Service worker
   - Manifest
   - Offline support básico

## Prioridad Baja

6. **Accesibilidad (a11y)**
   - Auditoría completa
   - Focus management
   - Screen reader testing

7. **Internacionalización (i18n)**
   - Soporte multi-idioma

## Bloqueado

- (Ninguno en este momento)
