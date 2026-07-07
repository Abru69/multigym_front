# Próximos Pasos

**Última sesión:** 2026-07-06 — Rediseño total + Dark Theme near-black

## Completado Reciente

- ✅ **Dark Theme Near-Black** — `#0a0a0a` base, `#141414` cards, `#aaff00` accent
- ✅ **Rediseño Total** — 37 archivos, ~439 reemplazos, estructuras nuevas
- ✅ **Landing** — Hero full-bleed, pricing 3 tiers, alternating features
- ✅ **Admin** — Card-based Users, product grid Inventory, two-column RoutineBuilder
- ✅ **Shop** — ProductCard hover zoom, Cart two-column, Checkout step indicator
- ✅ **Layouts** — Sidebar fijo, Auth split layout, Client premium header
- ✅ Platform Dashboard, Tenants, Users — CRUD completo con backend
- ✅ SaaS Plans — resolución desde `GET /api/saas-plans`

## Prioridad Alta

1. **Verificar UI en navegador**
   - Ejecutar `npm run dev` y revisar todas las páginas
   - Verificar que no queden colores hardcoded en `bg-white`, `text-gray-900`, etc.
   - Probar mobile responsive

2. **Fix Lint Errors (132)**
   - `react-refresh/only-export-components` — Considerar agregar `/* eslint-disable */` temporalmente o mover exports
   - `@typescript-eslint/no-unused-vars` — Eliminar imports/variables no usadas
   - `jsx-a11y` — Agregar aria-labels y keyboard handlers

3. **Tests Unitarios**
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
