import { NavLink } from 'react-router-dom'
import { Dumbbell, ShoppingBag, User } from 'lucide-react'

const navItems = [
  { to: '/app/rutinas', icon: Dumbbell, label: 'Rutinas' },
  { to: '/tienda', icon: ShoppingBag, label: 'Tienda' },
  { to: '/app/perfil', icon: User, label: 'Perfil' },
]

export function MemberNav() {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--header-bg)] px-2 py-2 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            background: isActive ? 'var(--accent-muted)' : 'transparent',
          })}
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
