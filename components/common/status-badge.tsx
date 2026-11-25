import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  colorClass?: string
  className?: string
}

const defaultColors: Record<string, string> = {
  // General statuses
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-amber-100 text-amber-800',
  
  // Order statuses
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  
  // Payment statuses
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  
  // Product statuses
  draft: 'bg-gray-100 text-gray-800',
  archived: 'bg-amber-100 text-amber-800',
  
  // Ticket statuses
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-amber-100 text-amber-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-100 text-gray-800',
  
  // Ticket priorities
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
  
  // Invoice statuses
  overdue: 'bg-red-100 text-red-800',
  
  // Notification types
  alert: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
}

export function StatusBadge({ status, colorClass, className }: StatusBadgeProps) {
  const color = colorClass || defaultColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        color,
        className
      )}
    >
      {label}
    </span>
  )
}
