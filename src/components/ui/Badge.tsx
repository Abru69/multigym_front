import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)]/10 text-[var(--accent-text)] border-[var(--accent)]/20',
        secondary: 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]',
        destructive:
          'bg-red-500/10 text-red-400 border-red-500/20',
        outline: 'border-[var(--border)] bg-transparent text-[var(--text-primary)]',
        success:
          'bg-green-500/10 text-green-400 border-green-500/20',
        warning:
          'bg-amber-500/10 text-amber-400 border-amber-500/20',
        glass:
          'bg-[var(--card)] text-[var(--text-primary)] border-[var(--border)]',
        'glass-accent':
          'bg-[var(--accent)]/10 text-[var(--accent-text)] border-[var(--accent)]/20',
        'glass-error':
          'bg-red-500/10 text-red-400 border-red-500/20',
        'glass-warning':
          'bg-amber-500/10 text-amber-400 border-amber-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
