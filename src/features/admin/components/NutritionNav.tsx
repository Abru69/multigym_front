import { Apple, ChefHat, ClipboardList, Scale } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { label: 'Planes', to: '/admin/nutricion', icon: ClipboardList },
  { label: 'Alimentos', to: '/admin/nutricion/alimentos', icon: Apple },
  { label: 'Recetas', to: '/admin/nutricion/recetas', icon: ChefHat },
  { label: 'Equivalencias', to: '/admin/nutricion/equivalencias', icon: Scale },
] as const

export function NutritionNav() {
  return (
    <nav
      aria-label="Sección de nutrición"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1 sm:grid-cols-4"
    >
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/admin/nutricion'}
          className={({ isActive }) =>
            `flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
              isActive
                ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
            }`
          }
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
