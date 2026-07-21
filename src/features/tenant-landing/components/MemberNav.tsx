import { NavLink } from 'react-router-dom'
import { Dumbbell, ShoppingBag, User } from 'lucide-react'

const navItems = [
  { to: '/app/rutinas', icon: Dumbbell, label: 'Rutinas' },
  { to: '/tienda', icon: ShoppingBag, label: 'Tienda' },
  { to: '/app/perfil', icon: User, label: 'Perfil' },
]

export function MemberNav() {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--card)]/80 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1.5 pb-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-all active:scale-95"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className="text-[10px] font-semibold leading-none"
                  style={{ color: isActive ? 'var(--accent)' : undefined }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
