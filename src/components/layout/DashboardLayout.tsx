import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, ChevronDown, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

export interface NavItem {
  to: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  end?: boolean
}

export interface NavSection {
  label: string
  items: NavItem[]
}

interface DashboardLayoutProps {
  navItems: NavItem[]
  navSections?: NavSection[]
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
  navSections,
  logo,
  title,
  subtitle,
  user,
  onLogout,
  rightActions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const sections = navSections?.length ? navSections : [{ label: '', items: navItems }]
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((section) => [section.label || 'main', true]))
  )

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionLabel]: !current[sectionLabel],
    }))
  }

  const closeDropdown = useCallback(() => setDropdownOpen(false), [])

  useEffect(() => {
    if (!dropdownOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDropdown()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [dropdownOpen, closeDropdown])

  const renderNavSections = (onNavClick?: () => void) =>
    sections.map((section) => (
      <div key={section.label || 'main'} className="mb-3 last:mb-0">
        {section.label && (
          <button
            type="button"
            onClick={() => toggleSection(section.label)}
            aria-expanded={expandedSections[section.label] ?? true}
            className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)] uppercase transition-colors hover:bg-[var(--surface-hover)]"
          >
            {section.label}
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform',
                expandedSections[section.label] === false && '-rotate-90'
              )}
            />
          </button>
        )}
        <div
          className={cn(
            'space-y-1 overflow-hidden transition-[max-height,opacity] duration-200',
            expandedSections[section.label || 'main'] === false
              ? 'max-h-0 opacity-0'
              : 'max-h-[500px] opacity-100'
          )}
        >
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all active:scale-[0.98]',
                  isActive
                    ? 'bg-[var(--accent)]/10 font-semibold text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent)]'
                )
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    ))

  return (
    <div className="flex min-h-dvh w-full bg-[var(--bg-secondary)]">
      {/* Desktop Sidebar — only renders at lg+ */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:sticky lg:top-0 lg:h-dvh lg:z-40 border-r border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-3 px-5 py-6">
          {logo}
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </span>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {renderNavSections()}
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-text)]">
              {user?.initials ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {user?.name ?? 'User'}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {user?.email ?? 'user@email.com'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute top-0 left-0 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {logo}
                  <div className="min-w-0 flex-1">
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-active)] active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
                {renderNavSections(() => setSidebarOpen(false))}
              </nav>

              <div className="border-t border-[var(--border)] p-3">
                <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-bold text-[var(--accent-text)]">
                    {user?.initials ?? 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {user?.name ?? 'User'}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {user?.email ?? 'user@email.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-[0.98]"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                </button>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.98]"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content — takes ALL remaining space, includes mobile header */}
      <main className="flex-1 min-w-0 w-full">
        {/* Mobile Header — inside main, never competes with sidebar */}
        <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--card)]/80 lg:hidden">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-active)] active:scale-95"
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

            <div className="flex items-center gap-2">
              {rightActions}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] pl-1.5 pr-3 transition-all hover:bg-[var(--surface-hover)] active:scale-95"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-[10px] font-bold text-[var(--accent-text)]">
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
                        onClick={() => {
                          toggleTheme()
                          closeDropdown()
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
                      >
                        {isDark ? <Sun size={14} /> : <Moon size={14} />}
                        {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                      </button>
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
        </div>

        {/* Desktop Header */}
        <div className="hidden items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-8 py-4 lg:flex">
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
                      onClick={() => {
                        toggleTheme()
                        closeDropdown()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
                    >
                      {isDark ? <Sun size={14} /> : <Moon size={14} />}
                      {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                    </button>
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

        <div className="w-full p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
