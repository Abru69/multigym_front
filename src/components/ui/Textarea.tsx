import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] transition-all duration-300 placeholder:text-[var(--text-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20'
            : 'border-[var(--border)] hover:border-[var(--border-hover)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
