# Multigym Front — AI Agent Start Here

## ¿Qué es este proyecto?

Plataforma SaaS multi-tenant para gestión de gimnasios. React 19 + TypeScript + Vite + Tailwind CSS v4.

## Lee esto primero

1. **`.ai/RULES.md`** — Reglas que debes seguir obligatoriamente
2. **`docs/AI_CONTEXT.md`** — Contexto completo del proyecto (stack, arquitectura, módulos)
3. **`docs/NEXT_SESSION.md`** — Qué hacer en esta sesión

## Comando rápido

```bash
npm run lint && npm run format && npm run build
```

## Estructura del proyecto

```
src/
├── components/ui/       # Componentes reutilizables
├── features/            # Módulos de negocio
│   ├── admin/           # Panel admin (completado)
│   ├── auth/            # Login, registro, recuperación
│   ├── client/          # Portal cliente
│   ├── landing/         # Landing SaaS
│   ├── platform/        # Super Admin
│   └── shop/            # E-Commerce
├── hooks/               # Custom hooks
├── layouts/             # Layouts compartidos
├── lib/                 # Utilidades (api, utils)
├── pages/               # NotFound.tsx (404)
├── router/              # Rutas + guards
└── types/               # TypeScript interfaces
```

## Documentación

| Archivo                   | Contenido                      |
| ------------------------- | ------------------------------ |
| `.ai/RULES.md`            | Reglas obligatorias            |
| `.ai/BOOTSTRAP_PROMPT.md` | Prompt para nueva sesión       |
| `.ai/UPDATE_DOCS.md`      | Cómo mantener los docs         |
| `docs/AI_CONTEXT.md`      | Contexto profundo del proyecto |
| `docs/PROJECT_STATUS.md`  | Estado actual                  |
| `docs/NEXT_SESSION.md`    | Próximos pasos                 |
| `docs/CHANGELOG.md`       | Historial de cambios           |

## Estado actual

- ✅ Build passing
- ✅ Admin redesign completo (14 páginas)
- ✅ CSS migration completa
- ✅ Nutrition Module (Admin CRUD + Cliente store)
- ✅ 6 Roles con control de acceso por página
- ⚠️ Lint: problemas preexistentes

---

_Última actualización: 2026-07-13_
