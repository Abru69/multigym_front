# Reglas para Agentes de IA

## Obligatorio

1. **SIEMPRE** ejecutar `npm run lint && npm run format && npm run build` después de cada módulo
2. **SIEMPRE** leer `docs/AI_CONTEXT.md` antes de empezar a trabajar
3. **SIEMPRE** seguir Feature-Sliced Design para estructura de carpetas
4. **SIEMPRE** usar TypeScript estricto (no `any`)
5. **SIEMPRE** validar accesibilidad (aria-labels, semantic HTML)

## Prohibido

1. **NUNCA** usar `alert()` o `window.confirm()` — usar Modal/Toast/ConfirmDialog
2. **NUNCA** importar archivos CSS en páginas — usar Tailwind CSS
3. **NUNCA** usar `any` — definir interfaces explícitas
4. **NUNCA** hardcodear tenantId — usar resolución por subdominio
5. **NUNCA** commitear sin pasar lint y build

## Estilo de Código

```typescript
// ✅ Correcto
interface UserProps {
  name: string
  onSelect: (id: string) => void
}

// ❌ Incorrecto
function User({ name, onSelect }: any) { ... }
```

## Componentes UI

- Usar `Modal` para diálogos (no inline modales con `position: fixed`)
- Usar `Toast` para notificaciones (no alert)
- Usar `ConfirmDialog` para eliminaciones (no window.confirm)
- Usar `SearchBar` con debounce (no input directo)
- Usar `FormField` para formularios (con label + error)

## Commands

```bash
npm run lint          # Verificar lint
npm run lint:fix      # Auto-fix lint
npm run format        # Formatear con Prettier
npm run build         # Build de producción
npm run dev           # Servidor de desarrollo
```
