import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 backdrop-blur-md',
  {
    variants: {
      variant: {
        default: 'border-accent/30 bg-accent/15 text-accent',
        secondary: 'border-white/[0.08] bg-white/[0.06] text-text-secondary',
        destructive: 'border-error/30 bg-error/15 text-error',
        outline: 'border-white/[0.08] bg-transparent text-text-primary',
        success: 'border-accent/30 bg-accent/15 text-accent',
        warning: 'border-warning/30 bg-warning/15 text-warning',
        glass: 'border-white/[0.1] bg-white/[0.06] text-text-primary backdrop-blur-xl',
        'glass-accent': 'border-accent/20 bg-accent/10 text-accent backdrop-blur-xl',
        'glass-error': 'border-error/20 bg-error/10 text-error backdrop-blur-xl',
        'glass-warning': 'border-warning/20 bg-warning/10 text-warning backdrop-blur-xl',
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
