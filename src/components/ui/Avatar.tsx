import { useMemo } from 'react'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

const colorPalette = [
  'bg-blue-500/20 text-blue-400 ring-blue-500/20',
  'bg-emerald-500/20 text-emerald-400 ring-emerald-500/20',
  'bg-purple-500/20 text-purple-400 ring-purple-500/20',
  'bg-amber-500/20 text-amber-400 ring-amber-500/20',
  'bg-rose-500/20 text-rose-400 ring-rose-500/20',
  'bg-cyan-500/20 text-cyan-400 ring-cyan-500/20',
]

function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name])
  const colorIndex = useMemo(() => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % colorPalette.length
  }, [name])

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-white/[0.06]',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold ring-2',
        sizeClasses[size],
        colorPalette[colorIndex],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

export { Avatar }
