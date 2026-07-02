import { useState, type ReactNode } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
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
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg bg-[var(--surface)] p-2 text-[var(--text-secondary)] transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          <Link to={navItems[0].to} className="flex items-center gap-3">
            {logo}
            <div className="hidden sm:block">
              <h1 className="text-sm leading-tight font-bold text-[var(--text-primary)]">
                {title}
              </h1>
              <p className="text-[10px] font-semibold tracking-widest text-[var(--accent)] uppercase">
                {subtitle}
              </p>
            </div>
          </Link>

          <nav className="ml-4 hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200"
                style={({ isActive }) => ({
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                })}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {rightActions}
          <ThemeToggle />

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5 pr-3 transition-colors"
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 shadow-xl"
                >
                  <div className="mb-1 border-b border-[var(--border)] px-4 py-2">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {user?.name ?? 'User'}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user?.email ?? 'user@email.com'}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
                <div className="flex items-center gap-3">
                  {logo}
                  <h1 className="text-sm font-bold text-[var(--text-primary)]">{title}</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg bg-[var(--bg-primary)] p-1.5 text-[var(--text-secondary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all"
                    style={({ isActive }) => ({
                      background: isActive ? 'var(--accent)' : 'transparent',
                      color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                      boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                    })}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-7xl"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
