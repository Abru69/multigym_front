import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-[0_0_16px_rgba(66,204,99,0.25)] hover:shadow-[0_0_24px_rgba(66,204,99,0.35)]',
        destructive: 'bg-[var(--error)] hover:bg-[var(--error-hover)] text-white',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-white/[0.04] hover:border-[var(--border-hover)]',
        secondary:
          'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
        ghost:
          'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]',
        link: 'text-[var(--accent)] underline-offset-4 hover:underline',
        glass:
          'border border-[var(--glass-border)] bg-[var(--card)] backdrop-blur-xl text-[var(--text-primary)] hover:bg-white/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.2)]',
        'glass-accent':
          'border border-[var(--accent)]/20 bg-[var(--accent)]/10 backdrop-blur-xl text-[var(--accent)] hover:bg-[var(--accent)]/15 shadow-[0_0_12px_rgba(66,204,99,0.15)]',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
