'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { rcSubscriptions } from '@/lib/mock-data'

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  trial: '#3b82f6',
  grace_period: '#f59e0b',
  paused: '#8b5cf6',
  cancelled: '#ef4444',
  expired: '#6b7280',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trial: 'Trial',
  grace_period: 'Grace Period',
  paused: 'Paused',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export function SubscriptionBreakdown() {
  const counts: Record<string, number> = {}
  for (const sub of rcSubscriptions) {
    counts[sub.status] = (counts[sub.status] ?? 0) + 1
  }

  const data = Object.entries(counts).map(([status, value]) => ({
    name: STATUS_LABELS[status] ?? status,
    value,
    color: STATUS_COLORS[status] ?? '#6b7280',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value, 'Subscribers']}
              contentStyle={{
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
