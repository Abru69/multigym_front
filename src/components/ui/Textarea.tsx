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
          'flex min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
