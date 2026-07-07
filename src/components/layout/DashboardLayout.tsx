import { useState, type ReactNode } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NavItem {
  to: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  end?: boolean
}

interface DashboardLayoutProps {
  navItems: NavItem[]
  logo: ReactNode
  title: string
  subtitle: string
  user: {
    name: string
    email: string
    initials: string
  } | null
  onLogout: () => void
  rightActions?: ReactNode
}

export function DashboardLayout({
  navItems,
  logo,
  title,
  subtitle,
  user,
  onLogout,
  rightActions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-[var(--card)] border-r border-[var(--border)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          {logo}
          <div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </span>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[var(--accent)]/10 text-[var(--accent-text)] font-semibold border-l-3 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                )
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-text)]">
              {user?.initials ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {user?.email ?? 'user@email.com'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 flex h-screen w-64 flex-col bg-[var(--card)] border-r border-[var(--border)] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5">
                <div className="flex items-center gap-3">
                  {logo}
                  <div>
                    <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                      {title}
                    </span>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl bg-[var(--surface-hover)] p-1.5 text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)]"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[var(--accent)]/10 text-[var(--accent-text)] font-semibold border-l-3 border-[var(--accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      )
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-[var(--border)] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-text)]">
                    {user?.initials ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {user?.name ?? 'User'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {user?.email ?? 'user@email.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl bg-[var(--surface-hover)] p-2 text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)]"
          >
            <Menu size={20} />
          </button>
          <Link to={navItems[0].to} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-black text-[var(--accent-text)]">
              MG
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {subtitle}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {rightActions}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5 pr-3 transition-all hover:bg-[var(--surface-hover)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--accent-text)]">
                {user?.initials ?? 'U'}
              </div>
              <ChevronDown size={14} className="text-[var(--text-muted)]" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 shadow-lg"
                >
                  <div className="mb-1 border-b border-[var(--border)] px-4 py-3">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {user?.name ?? 'User'}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {user?.email ?? 'user@email.com'}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-all hover:bg-red-500/10"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="hidden lg:flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-8 py-4">
          <div className="flex items-center gap-6">
            <Link to={navItems[0].to} className="flex items-center gap-3">
              {logo}
              <div>
                <h1 className="text-sm leading-tight font-bold tracking-tight text-[var(--text-primary)]">
                  {title}
                </h1>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
                  {subtitle}
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {rightActions}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5 pr-3 transition-all hover:bg-[var(--surface-hover)]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--accent-text)]">
                  {user?.initials ?? 'U'}
                </div>
                <span className="hidden max-w-[100px] truncate text-xs font-bold text-[var(--text-primary)] sm:block">
                  {user?.name?.split(' ')[0] ?? 'User'}
                </span>
                <ChevronDown size={14} className="text-[var(--text-muted)]" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 shadow-lg"
                  >
                    <div className="mb-1 border-b border-[var(--border)] px-4 py-3">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {user?.name ?? 'User'}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {user?.email ?? 'user@email.com'}
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-all hover:bg-red-500/10"
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
