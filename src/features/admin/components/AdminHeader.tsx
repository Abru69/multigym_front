import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: ReactNode
}

export function AdminHeader({ title, subtitle, icon: Icon, action }: AdminHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 shadow-[0_0_16px_rgba(66,204,99,0.15)]">
            <Icon size={24} className="text-[var(--accent)]" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
