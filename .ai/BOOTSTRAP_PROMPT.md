# Bootstrap Prompt — Multigym Front

Copia y pega esto al inicio de cada sesión de trabajo:

---

## Contexto del Proyecto

Estás trabajando en `multigym_front`, una plataforma SaaS multi-tenant para gestión de gimnasios.

### Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (vía `@tailwindcss/vite`)
- Zustand (estado global), Recharts (gráficas), Framer Motion (animaciones)
- Lucide React (iconos), react-router-dom v7 (enrutamiento)

### Arquitectura

- Feature-Sliced Design
- Multi-tenant por subdominio
- CSS variables para dark/light mode
- `cva` + `clsx` + `tailwind-merge` para componentes

### Archivos Clave

- `docs/AI_CONTEXT.md` — Contexto completo del proyecto
- `docs/PROJECT_STATUS.md` — Estado actual
- `docs/NEXT_SESSION.md` — Próximos pasos
- `.ai/RULES.md` — Reglas que debes seguir

### Commands

```bash
npm run lint && npm run format && npm run build
```

### Tu Tarea

1. Leer `docs/NEXT_SESSION.md` para saber qué hacer
2. Seguir `.ai/RULES.md` estrictamente
3. Después de cada cambio, ejecutar lint + build
4. Actualizar `docs/CHANGELOG.md` con los cambios realizados

---
