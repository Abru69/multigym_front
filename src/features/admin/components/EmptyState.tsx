import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <Icon size={32} className="text-[var(--accent)]" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-lg font-bold tracking-tight text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
      )}
      {action}
    </div>
  )
}
