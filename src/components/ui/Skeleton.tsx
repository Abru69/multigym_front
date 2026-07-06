import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-[var(--surface)] via-[var(--surface-hover)] to-[var(--surface)]',
        className
      )}
    />
  )
}

export { Skeleton }
