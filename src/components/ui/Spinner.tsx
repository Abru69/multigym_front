import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: number
  className?: string
}

function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn(
        'animate-spin text-[var(--accent)] drop-shadow-[0_0_8px_rgba(66,204,99,0.4)]',
        className
      )}
    />
  )
}

export { Spinner }
