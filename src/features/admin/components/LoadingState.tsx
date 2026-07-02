import { Spinner } from '@/components/ui/Spinner'

interface LoadingStateProps {
  text?: string
}

export function LoadingState({ text = 'Cargando...' }: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      role="status"
      aria-label={text}
    >
      <Spinner size={32} />
      <p className="mt-4 text-sm text-[var(--text-muted)]">{text}</p>
    </div>
  )
}
