import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 backdrop-blur-md',
  {
    variants: {
      variant: {
        default:
          'border-[var(--accent)]/30 bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_10px_rgba(66,204,99,0.1)]',
        secondary: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]',
        destructive:
          'border-[var(--error)]/30 bg-[var(--error)]/15 text-[var(--error)] shadow-[0_0_10px_rgba(239,68,68,0.1)]',
        outline: 'border-[var(--border)] bg-transparent text-[var(--text-primary)]',
        success:
          'border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)] shadow-[0_0_10px_rgba(34,197,94,0.1)]',
        warning:
          'border-[var(--warning)]/30 bg-[var(--warning)]/15 text-[var(--warning)] shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        glass:
          'border-white/[0.08] bg-[var(--card)]/80 text-[var(--text-primary)] backdrop-blur-xl',
        'glass-accent':
          'border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] backdrop-blur-xl shadow-[0_0_12px_rgba(66,204,99,0.08)]',
        'glass-error':
          'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error)] backdrop-blur-xl',
        'glass-warning':
          'border-[var(--warning)]/20 bg-[var(--warning)]/10 text-[var(--warning)] backdrop-blur-xl',
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

export { Badge, badgeVariants }
