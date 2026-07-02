import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  htmlFor?: string
}

export function FormField({ label, required, error, children, htmlFor }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase"
      >
        {label}
        {required && <span className="ml-1 text-[var(--error)]">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
