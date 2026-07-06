import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-primary)] transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-[var(--error)] focus-visible:shadow-[0_0_16px_rgba(239,68,68,0.1)] focus-visible:ring-2 focus-visible:ring-[var(--error)]/30'
            : 'border-[var(--border)] hover:border-[var(--border-hover)] focus-visible:border-[var(--accent)] focus-visible:shadow-[0_0_16px_rgba(66,204,99,0.08)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
