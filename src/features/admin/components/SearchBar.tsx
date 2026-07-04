import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: SearchBarProps) {
  return (
    <div className={className}>
      <div className="relative">
        <Search
          size={16}
          className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-2 pr-10 pl-10 text-sm text-[var(--text-primary)] backdrop-blur-xl transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
