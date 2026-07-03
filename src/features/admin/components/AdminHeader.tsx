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
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
          {Icon && <Icon size={28} className="text-[var(--accent)]" />}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
