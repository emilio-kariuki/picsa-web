'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { userGrowthData } from '@/lib/mock-data'

const chartConfig = {
  users: {
    label: 'Total Users',
    color: 'var(--chart-2)',
  },
  active: {
    label: 'Active Users',
    color: 'var(--chart-3)',
  },
}

export function UserGrowthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>Total and active users over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart data={userGrowthData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent />
              }
            />
            <Area
              dataKey="users"
              type="monotone"
              fill="var(--color-users)"
              fillOpacity={0.3}
              stroke="var(--color-users)"
              strokeWidth={2}
            />
            <Area
              dataKey="active"
              type="monotone"
              fill="var(--color-active)"
              fillOpacity={0.3}
              stroke="var(--color-active)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
