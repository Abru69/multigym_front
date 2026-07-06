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
    <div className="relative flex min-h-screen flex-col bg-[var(--bg-primary)]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[400px] bg-[var(--ambient-glow)]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 backdrop-blur-2xl lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-secondary)] backdrop-blur-md transition-all hover:bg-white/[0.08] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <Link to={navItems[0].to} className="flex items-center gap-3">
              {logo}
              <div className="hidden sm:block">
                <h1 className="text-sm leading-tight font-bold tracking-tight text-[var(--text-primary)]">
                  {title}
                </h1>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
                  {subtitle}
                </p>
              </div>
            </Link>

            <nav className="ml-4 hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-x-0 -bottom-[13px] h-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--detail)]"
                          style={{ boxShadow: '0 2px 8px rgba(66,204,99,0.3)' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {rightActions}

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5 pr-3 backdrop-blur-md transition-all hover:border-[var(--border-hover)] hover:bg-white/[0.08]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-[10px] font-bold text-white shadow-[0_0_12px_rgba(66,204,99,0.3)]">
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
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] py-2 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                  >
                    <div className="mb-1 border-b border-[var(--border)] px-4 py-3">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {user?.name ?? 'User'}
                      </p>
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        {user?.email ?? 'user@email.com'}
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--error)] transition-all hover:bg-[var(--error)]/10"
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 left-0 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-[0_0_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
                <div className="flex items-center gap-3">
                  {logo}
                  <h1 className="text-sm font-bold text-[var(--text-primary)]">{title}</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 text-[var(--text-secondary)] backdrop-blur-md transition-all hover:bg-white/[0.08]"
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
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] text-white shadow-[0_0_16px_rgba(66,204,99,0.3)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
                      )
                    }
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
      <main className="relative z-10 flex-1 overflow-x-hidden p-4 lg:p-8">
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
