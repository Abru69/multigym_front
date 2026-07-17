import { Badge } from './Badge'

type StatusType =
  | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED'
  | 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'AUTHORIZED'
  | string

const statusVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
  TRIAL: 'warning',
  ACTIVE: 'success',
  COMPLETED: 'success',
  PAST_DUE: 'warning',
  PENDING: 'warning',
  AUTHORIZED: 'warning',
  SUSPENDED: 'destructive',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
  REFUNDED: 'default',
}

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? 'default'
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}
