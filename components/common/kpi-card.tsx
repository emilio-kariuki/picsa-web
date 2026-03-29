import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowDownIcon, ArrowUpIcon } from '@/components/ui/icons'
import type { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  className?: string
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'from last month',
  icon,
  className,
}: KPICardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="mt-1 flex items-center gap-1 text-sm">
              {isPositive && (
                <>
                  <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-emerald-600">+{change}%</span>
                </>
              )}
              {isNegative && (
                <>
                  <ArrowDownIcon className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-600">{change}%</span>
                </>
              )}
              {!isPositive && !isNegative && (
                <span className="font-medium text-muted-foreground">0%</span>
              )}
              <span className="text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
