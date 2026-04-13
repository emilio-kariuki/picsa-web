import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ActivityIcon,
  BellRingIcon,
  CameraIcon,
  ChevronRightIcon,
  Clock3Icon,
  CreditCardIcon,
  DollarSignIcon,
  FolderKanbanIcon,
  ImageIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  UsersIcon,
} from '@/components/ui/icons'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { getAdminOverview, getAdminAnalytics, type AdminOverview, type AdminAnalytics } from '@/lib/admin-overview-api'
import { getAdminPaymentsOverview, type AdminPaymentOverview } from '@/lib/admin-payments-api'
import { isAdminApiError } from '@/lib/api'
import { PageHeader } from '@/components/common/page-header'
import { KPICard } from '@/components/common/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

const OVERVIEW_QUERY_KEY = 'admin-overview'
const ANALYTICS_QUERY_KEY = 'admin-analytics'
const PAYMENTS_OVERVIEW_QUERY_KEY = 'admin-payments-overview'

const dashboardChartColors = {
  emerald: 'var(--chart-1)',
  sky: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  rose: 'var(--chart-4)',
  violet: 'var(--chart-5)',
  slate: 'hsl(var(--muted-foreground))',
}

const usersChartConfig = {
  value: {
    label: 'Users',
    color: dashboardChartColors.emerald,
  },
} satisfies ChartConfig

const eventStateChartConfig = {
  value: {
    label: 'Events',
    color: dashboardChartColors.sky,
  },
} satisfies ChartConfig

const mediaStateChartConfig = {
  value: {
    label: 'Images',
    color: dashboardChartColors.rose,
  },
} satisfies ChartConfig

const growthChartConfig = {
  users: {
    label: 'New users',
    color: dashboardChartColors.emerald,
  },
  events: {
    label: 'New events',
    color: dashboardChartColors.sky,
  },
} satisfies ChartConfig

const dauChartConfig = {
  dau: {
    label: 'Active users',
    color: dashboardChartColors.violet,
  },
} satisfies ChartConfig

const revenueChartConfig = {
  mrr: {
    label: 'MRR',
    color: dashboardChartColors.violet,
  },
} satisfies ChartConfig

const ticketChartConfig = {
  value: {
    label: 'Tickets',
    color: dashboardChartColors.amber,
  },
} satisfies ChartConfig

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function calculatePercentage(value: number, total: number) {
  if (total <= 0) {
    return 0
  }

  return (value / total) * 100
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`second-${index}`} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-85 rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-95 rounded-2xl" />
        <Skeleton className="h-95 rounded-2xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-95 rounded-2xl" />
        <Skeleton className="h-95 rounded-2xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-85 rounded-2xl" />
        <Skeleton className="h-85 rounded-2xl" />
      </div>
    </div>
  )
}

function buildUserMixData(overview: AdminOverview) {
  return [
    {
      label: 'Active',
      value: overview.activeUsers,
      fill: dashboardChartColors.emerald,
    },
    {
      label: 'Inactive',
      value: Math.max(overview.totalUsers - overview.activeUsers, 0),
      fill: dashboardChartColors.slate,
    },
    {
      label: 'Pro',
      value: overview.proUsers,
      fill: dashboardChartColors.sky,
    },
    {
      label: 'Admins',
      value: overview.adminUsers,
      fill: dashboardChartColors.violet,
    },
  ]
}

function buildEventStateData(overview: AdminOverview) {
  return [
    {
      label: 'Active',
      value: overview.activeEvents,
      fill: dashboardChartColors.sky,
    },
    {
      label: 'Archived',
      value: overview.archivedEvents,
      fill: dashboardChartColors.amber,
    },
    {
      label: 'Other',
      value: Math.max(
        overview.totalEvents - overview.activeEvents - overview.archivedEvents,
        0,
      ),
      fill: dashboardChartColors.slate,
    },
  ]
}

function buildMediaStateData(overview: AdminOverview) {
  return [
    {
      label: 'Ready',
      value: Math.max(
        overview.totalImages -
          overview.pendingModeratedImages -
          overview.rejectedImages,
        0,
      ),
      fill: dashboardChartColors.emerald,
    },
    {
      label: 'Pending',
      value: overview.pendingModeratedImages,
      fill: dashboardChartColors.rose,
    },
    {
      label: 'Rejected',
      value: overview.rejectedImages,
      fill: dashboardChartColors.amber,
    },
  ]
}

function buildActionCards(overview: AdminOverview) {
  return [
    {
      title: 'Users',
      description: 'Review access, deactivate accounts, and sync subscriptions.',
      href: '/admin/dashboard/users',
      metric: `${overview.totalUsers.toLocaleString()} total`,
      icon: UsersIcon,
    },
    {
      title: 'Events',
      description: 'Track active and archived events across the platform.',
      href: '/admin/dashboard/events',
      metric: `${overview.totalEvents.toLocaleString()} total`,
      icon: FolderKanbanIcon,
    },
    {
      title: 'Images',
      description: 'Handle pending moderation and review rejected uploads.',
      href: '/admin/dashboard/media',
      metric: `${overview.pendingModeratedImages.toLocaleString()} pending`,
      icon: ImageIcon,
    },
    {
      title: 'Notifications',
      description: 'Check system pushes and admin broadcast activity.',
      href: '/admin/dashboard/notifications',
      metric: `${overview.totalNotificationBatches.toLocaleString()} batches`,
      icon: BellRingIcon,
    },
  ] as const
}

function buildTicketStatusData(overview: AdminOverview) {
  return [
    {
      label: 'Open',
      value: overview.tickets.openCount,
      fill: dashboardChartColors.rose,
    },
    {
      label: 'In progress',
      value: overview.tickets.inProgressCount,
      fill: dashboardChartColors.amber,
    },
    {
      label: 'Resolved',
      value: overview.tickets.resolvedCount,
      fill: dashboardChartColors.emerald,
    },
    {
      label: 'Closed',
      value: Math.max(
        overview.tickets.totalCount -
          overview.tickets.openCount -
          overview.tickets.inProgressCount -
          overview.tickets.resolvedCount,
        0,
      ),
      fill: dashboardChartColors.slate,
    },
  ]
}

function buildGrowthSeriesData(overview: AdminOverview) {
  const userMap = new Map(overview.userGrowthSeries.map((p) => [p.date, p.count]))
  const eventMap = new Map(overview.eventGrowthSeries.map((p) => [p.date, p.count]))

  const allDates = [
    ...new Set([
      ...overview.userGrowthSeries.map((p) => p.date),
      ...overview.eventGrowthSeries.map((p) => p.date),
    ]),
  ].sort()

  return allDates.map((date) => ({
    date,
    shortDate: formatShortDate(date),
    users: userMap.get(date) ?? 0,
    events: eventMap.get(date) ?? 0,
  }))
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100)
}

function formatChangeLabel(change: number) {
  if (change === 0) return '0%'
  const sign = change > 0 ? '+' : ''
  return `${sign}${Math.round(change)}%`
}

function DashboardPage() {
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()

  const overviewQuery = useQuery({
    queryKey: [OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminOverview(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const paymentsOverviewQuery = useQuery({
    queryKey: [PAYMENTS_OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminPaymentsOverview(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const analyticsQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminAnalytics(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const overview = overviewQuery.data?.data.overview
  const paymentsOverview = paymentsOverviewQuery.data?.data.overview
  const analytics = analyticsQuery.data?.data.analytics
  const [activeUsersRange, setActiveUsersRange] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [growthTrendsRange, setGrowthTrendsRange] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const actionCards = useMemo(
    () => (overview ? buildActionCards(overview) : []),
    [overview],
  )

  const userMixData = useMemo(
    () => (overview ? buildUserMixData(overview) : []),
    [overview],
  )

  const eventStateData = useMemo(
    () => (overview ? buildEventStateData(overview) : []),
    [overview],
  )

  const mediaStateData = useMemo(
    () => (overview ? buildMediaStateData(overview) : []),
    [overview],
  )

  const ticketStatusData = useMemo(
    () => (overview ? buildTicketStatusData(overview) : []),
    [overview],
  )

  const growthSeriesData = useMemo(
    () => (overview ? buildGrowthSeriesData(overview) : []),
    [overview],
  )

  if (overviewQuery.isLoading) {
    return <DashboardSkeleton />
  }

  if (overviewQuery.isError || !overview) {
    const message =
      isAdminApiError(overviewQuery.error) || overviewQuery.error instanceof Error
        ? overviewQuery.error.message
        : 'Unable to load the dashboard right now.'

    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="A live operational snapshot of the Picsa platform."
        />
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlertIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Dashboard unavailable</h2>
              <p className="max-w-md text-sm text-muted-foreground">{message}</p>
            </div>
            <Button onClick={() => void overviewQuery.refetch()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live operational snapshot of the Picsa platform."
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/dashboard/audit-log">
              <ShieldCheckIcon className="mr-2 h-4 w-4" />
              Open audit log
            </Link>
          </Button>
        }
      />

      {/* Primary KPI row */}
      <section className="grid gap-4 lg:grid-cols-4">
        <KPICard
          title="Users"
          value={overview.totalUsers.toLocaleString()}
          change={Math.round(calculatePercentage(overview.proUsers, overview.totalUsers))}
          changeLabel="Pro adoption"
          icon={<UsersIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Active events"
          value={overview.activeEvents.toLocaleString()}
          change={Math.round(calculatePercentage(overview.activeEvents, overview.totalEvents))}
          changeLabel="of all events"
          icon={<CameraIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Images"
          value={overview.totalImages.toLocaleString()}
          change={Math.round(calculatePercentage(overview.pendingModeratedImages, Math.max(overview.totalImages, 1)))}
          changeLabel="pending moderation"
          icon={<ImageIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Notification batches"
          value={overview.totalNotificationBatches.toLocaleString()}
          change={Math.round(calculatePercentage(overview.adminUsers, Math.max(overview.totalUsers, 1)))}
          changeLabel="admins vs users"
          icon={<BellRingIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
      </section>

      {/* Secondary KPI row — growth + revenue + support */}
      <section className="grid gap-4 lg:grid-cols-4">
        <KPICard
          title="New users (30d)"
          value={overview.newUsersLast30d.toLocaleString()}
          change={overview.newUsersLast7d}
          changeLabel="last 7 days"
          icon={<UsersIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="New events (30d)"
          value={overview.newEventsLast30d.toLocaleString()}
          change={overview.newEventsLast7d}
          changeLabel="last 7 days"
          icon={<FolderKanbanIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        {paymentsOverview ? (
          <KPICard
            title="MRR"
            value={formatCurrency(paymentsOverview.subscriptions.mrr)}
            change={Math.round(paymentsOverview.subscriptions.mrrChange)}
            changeLabel="vs last month"
            icon={<DollarSignIcon className="h-5 w-5 text-muted-foreground" />}
            className="rounded-2xl border-border/70 bg-card/90 shadow-none"
          />
        ) : (
          <Skeleton className="h-36 rounded-2xl" />
        )}
        <KPICard
          title="Open tickets"
          value={overview.tickets.openCount.toLocaleString()}
          change={overview.tickets.urgentCount}
          changeLabel="urgent"
          icon={<TicketIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
      </section>

      {/* User engagement — DAU / WAU / MAU */}
      <section className="space-y-4">
        {analytics ? (
          <>
            <section className="grid gap-4 lg:grid-cols-4">
              <KPICard
                title="DAU (today)"
                value={analytics.dau.toLocaleString()}
                change={analytics.dauMauRatio}
                changeLabel="DAU/MAU ratio"
                icon={<ActivityIcon className="h-5 w-5 text-muted-foreground" />}
                className="rounded-2xl border-border/70 bg-card/90 shadow-none"
              />
              <KPICard
                title="WAU (7d)"
                value={analytics.wau.toLocaleString()}
                change={analytics.wau}
                changeLabel="unique users"
                icon={<ActivityIcon className="h-5 w-5 text-muted-foreground" />}
                className="rounded-2xl border-border/70 bg-card/90 shadow-none"
              />
              <KPICard
                title="MAU (30d)"
                value={analytics.mau.toLocaleString()}
                change={analytics.mau}
                changeLabel="unique users"
                icon={<UsersIcon className="h-5 w-5 text-muted-foreground" />}
                className="rounded-2xl border-border/70 bg-card/90 shadow-none"
              />
              <KPICard
                title="DAU/MAU ratio"
                value={`${analytics.dauMauRatio}%`}
                change={analytics.dauMauRatio}
                changeLabel="stickiness"
                icon={<SparklesIcon className="h-5 w-5 text-muted-foreground" />}
                className="rounded-2xl border-border/70 bg-card/90 shadow-none"
              />
            </section>

            <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Active users</CardTitle>
                    <CardDescription>
                      {activeUsersRange === 'daily' && 'Unique authenticated users per day over the last 30 days.'}
                      {activeUsersRange === 'weekly' && 'Unique authenticated users per week over the last 12 weeks.'}
                      {activeUsersRange === 'monthly' && 'Unique authenticated users per month over the last 12 months.'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 p-1">
                    {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setActiveUsersRange(range)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          activeUsersRange === range
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={dauChartConfig} className="h-70 w-full">
                  <AreaChart
                    data={(activeUsersRange === 'daily'
                      ? analytics.dauSeries
                      : activeUsersRange === 'weekly'
                        ? analytics.wauSeries
                        : analytics.mauSeries
                    ).map((p) => ({
                      date: p.date,
                      shortDate: activeUsersRange === 'daily'
                        ? formatShortDate(p.date)
                        : activeUsersRange === 'weekly'
                          ? `W${p.date.split('-')[1]}`
                          : new Date(p.date + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                      dau: p.count,
                    }))}
                    accessibilityLayer
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillDau" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dashboardChartColors.violet} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={dashboardChartColors.violet} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="shortDate"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      interval="preserveStartEnd"
                      minTickGap={40}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelKey="shortDate"
                          formatter={(value) => Number(value).toLocaleString()}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="dau"
                      stroke={dashboardChartColors.violet}
                      fill="url(#fillDau)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`analytics-kpi-${index}`} className="h-36 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-85 rounded-2xl" />
          </div>
        )}
      </section>

      {/* Growth trends — area chart with daily/weekly/monthly toggle */}
      <section>
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Growth trends</CardTitle>
                <CardDescription>
                  {growthTrendsRange === 'daily' && 'Daily new user signups and event creation over the last 30 days.'}
                  {growthTrendsRange === 'weekly' && 'Weekly new user signups and event creation over the last 12 weeks.'}
                  {growthTrendsRange === 'monthly' && 'Monthly new user signups and event creation over the last 12 months.'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dashboardChartColors.emerald }} />
                    Users
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dashboardChartColors.sky }} />
                    Events
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 p-1">
                  {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setGrowthTrendsRange(range)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        growthTrendsRange === range
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthChartConfig} className="h-70 w-full">
              <AreaChart
                data={(() => {
                  const userSeries =
                    growthTrendsRange === 'weekly'
                      ? overview.userGrowthWeeklySeries ?? []
                      : growthTrendsRange === 'monthly'
                        ? overview.userGrowthMonthlySeries ?? []
                        : overview.userGrowthSeries
                  const eventSeries =
                    growthTrendsRange === 'weekly'
                      ? overview.eventGrowthWeeklySeries ?? []
                      : growthTrendsRange === 'monthly'
                        ? overview.eventGrowthMonthlySeries ?? []
                        : overview.eventGrowthSeries
                  const userMap = new Map(userSeries.map((p) => [p.date, p.count]))
                  const eventMap = new Map(eventSeries.map((p) => [p.date, p.count]))
                  const allDates = [
                    ...new Set([...userSeries.map((p) => p.date), ...eventSeries.map((p) => p.date)]),
                  ].sort()
                  return allDates.map((date) => ({
                    date,
                    shortDate:
                      growthTrendsRange === 'daily'
                        ? formatShortDate(date)
                        : growthTrendsRange === 'weekly'
                          ? `W${date.split('-')[1]}`
                          : (() => {
                              const [y, m] = date.split('-')
                              const d = new Date(Number(y), Number(m) - 1)
                              return d.toLocaleDateString('en-US', { month: 'short' }) + " '" + y.slice(2)
                            })(),
                    users: userMap.get(date) ?? 0,
                    events: eventMap.get(date) ?? 0,
                  }))
                })()}
                accessibilityLayer
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardChartColors.emerald} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dashboardChartColors.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dashboardChartColors.sky} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dashboardChartColors.sky} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="shortDate"
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={dashboardChartColors.emerald}
                  fill="url(#fillUsers)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke={dashboardChartColors.sky}
                  fill="url(#fillEvents)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Revenue & Subscriptions + Support Tickets */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Revenue & Subscriptions */}
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Revenue & subscriptions</CardTitle>
                <CardDescription>
                  Monthly recurring revenue trend and subscriber health.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/dashboard/payments">
                  <CreditCardIcon className="mr-1.5 h-3.5 w-3.5" />
                  Payments
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {paymentsOverview ? (
              <>
                <ChartContainer config={revenueChartConfig} className="h-50 w-full">
                  <AreaChart
                    data={paymentsOverview.subscriptions.mrrSeries.map((p) => ({
                      month: p.month,
                      mrr: p.mrr / 100,
                    }))}
                    accessibilityLayer
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dashboardChartColors.violet} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={dashboardChartColors.violet} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v) => `$${v}`} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelKey="month"
                          formatter={(value) => `$${Number(value).toLocaleString()}`}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="mrr"
                      stroke={dashboardChartColors.violet}
                      fill="url(#fillMrr)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricPanel
                    title="Active subscriptions"
                    value={paymentsOverview.subscriptions.activeSubscriptions.toLocaleString()}
                    helper={`${formatChangeLabel(paymentsOverview.subscriptions.activeSubscriptionsChange)} vs last month`}
                    tone="emerald"
                  />
                  <MetricPanel
                    title="Trials"
                    value={paymentsOverview.subscriptions.trials.toLocaleString()}
                    helper={`${formatChangeLabel(paymentsOverview.subscriptions.trialsChange)} vs last month`}
                    tone="sky"
                  />
                  <MetricPanel
                    title="Churn rate"
                    value={`${paymentsOverview.subscriptions.churnRate.toFixed(1)}%`}
                    helper={`${formatChangeLabel(paymentsOverview.subscriptions.churnRateChange)} vs last month`}
                    tone={paymentsOverview.subscriptions.churnRate > 5 ? 'rose' : 'emerald'}
                  />
                  <MetricPanel
                    title="Event pass revenue"
                    value={formatCurrency(paymentsOverview.eventPasses.grossRevenue)}
                    helper={`${paymentsOverview.eventPasses.totalPurchases.toLocaleString()} total purchases`}
                    tone="violet"
                  />
                </div>
              </>
            ) : (
              <div className="flex h-85 items-center justify-center">
                <Skeleton className="h-full w-full rounded-2xl" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support tickets */}
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Support tickets</CardTitle>
                <CardDescription>
                  Current distribution of support ticket statuses and urgent items needing attention.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/dashboard/tickets">
                  <TicketIcon className="mr-1.5 h-3.5 w-3.5" />
                  Tickets
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <ChartContainer config={ticketChartConfig} className="h-50 w-full">
              <BarChart
                data={ticketStatusData}
                accessibilityLayer
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="label"
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                  }
                />
                <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                  {ticketStatusData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricPanel
                title="Awaiting staff response"
                value={overview.tickets.awaitingStaffResponseCount.toLocaleString()}
                helper="Tickets where the customer replied last"
                tone={overview.tickets.awaitingStaffResponseCount > 0 ? 'rose' : 'emerald'}
              />
              <MetricPanel
                title="Unassigned"
                value={overview.tickets.unassignedCount.toLocaleString()}
                helper="Open tickets not yet assigned to an agent"
                tone={overview.tickets.unassignedCount > 0 ? 'amber' : 'emerald'}
              />
              <MetricPanel
                title="Urgent"
                value={overview.tickets.urgentCount.toLocaleString()}
                helper="High-priority tickets requiring immediate attention"
                tone={overview.tickets.urgentCount > 0 ? 'rose' : 'emerald'}
              />
              <MetricPanel
                title="Total resolved"
                value={overview.tickets.resolvedCount.toLocaleString()}
                helper={`${overview.tickets.totalCount.toLocaleString()} tickets total`}
                tone="emerald"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* User access snapshot + Event lifecycle (existing) */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">User access snapshot</CardTitle>
                <CardDescription>
                  A fast read on who can access Picsa right now and how many of them are paid or privileged operators.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                <SparklesIcon className="h-3.5 w-3.5" />
                Live snapshot
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <ChartContainer config={usersChartConfig} className="h-72.5 w-full">
              <BarChart
                data={userMixData}
                accessibilityLayer
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="label"
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                  }
                />
                <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                  {userMixData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="grid gap-3">
              <MetricPanel
                title="Active user rate"
                value={formatPercent(
                  calculatePercentage(overview.activeUsers, overview.totalUsers),
                )}
                helper={`${overview.activeUsers.toLocaleString()} of ${overview.totalUsers.toLocaleString()} users can currently sign in.`}
                tone="emerald"
              />
              <MetricPanel
                title="Pro adoption"
                value={formatPercent(
                  calculatePercentage(overview.proUsers, overview.totalUsers),
                )}
                helper={`${overview.proUsers.toLocaleString()} accounts are currently on Pro.`}
                tone="sky"
              />
              <MetricPanel
                title="Admin footprint"
                value={formatPercent(
                  calculatePercentage(overview.adminUsers, overview.totalUsers),
                )}
                helper={`${overview.adminUsers.toLocaleString()} admins are operating the workspace.`}
                tone="violet"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Event lifecycle</CardTitle>
            <CardDescription>
              A clean view of what is live, what has been closed, and what is sitting outside the primary event states.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-center">
              <ChartContainer config={eventStateChartConfig} className="h-62.5 w-full max-w-[320px]">
                <PieChart>
                  <Pie
                    data={eventStateData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {eventStateData.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelKey="label"
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="space-y-3">
              {eventStateData.map((entry) => (
                <LegendRow
                  key={entry.label}
                  label={entry.label}
                  value={entry.value}
                  color={entry.fill}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Media moderation + Priority queue (existing) */}
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Media moderation</CardTitle>
            <CardDescription>
              The image pipeline is healthiest when pending work stays low and rejected uploads remain the exception.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <MetricPanel
                title="Pending review"
                value={overview.pendingModeratedImages.toLocaleString()}
                helper="Uploads waiting on host or admin moderation."
                tone={overview.pendingModeratedImages > 0 ? 'rose' : 'emerald'}
              />
              <MetricPanel
                title="Rejected uploads"
                value={overview.rejectedImages.toLocaleString()}
                helper="Images explicitly declined by moderation."
                tone={overview.rejectedImages > 0 ? 'amber' : 'emerald'}
              />
              <MetricPanel
                title="New images (7d)"
                value={overview.newImagesLast7d.toLocaleString()}
                helper={`${overview.newImagesLast30d.toLocaleString()} in the last 30 days.`}
                tone="sky"
              />
            </div>
            <ChartContainer config={mediaStateChartConfig} className="h-72.5 w-full">
              <BarChart
                data={mediaStateData}
                layout="vertical"
                accessibilityLayer
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="label"
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                  }
                />
                <Bar dataKey="value" radius={12}>
                  {mediaStateData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Priority queue</CardTitle>
            <CardDescription>
              These are the parts of the platform most likely to need intervention first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PriorityRow
              label="Pending moderation"
              value={overview.pendingModeratedImages}
              tone={overview.pendingModeratedImages > 0 ? 'rose' : 'emerald'}
              helper="Images waiting on host or admin review"
            />
            <PriorityRow
              label="Awaiting staff response"
              value={overview.tickets.awaitingStaffResponseCount}
              tone={overview.tickets.awaitingStaffResponseCount > 0 ? 'rose' : 'emerald'}
              helper="Support tickets needing admin follow-up"
            />
            <PriorityRow
              label="Urgent tickets"
              value={overview.tickets.urgentCount}
              tone={overview.tickets.urgentCount > 0 ? 'amber' : 'emerald'}
              helper="High-priority tickets requiring immediate action"
            />
            <PriorityRow
              label="Rejected images"
              value={overview.rejectedImages}
              tone={overview.rejectedImages > 0 ? 'amber' : 'emerald'}
              helper="Uploads that were explicitly rejected"
            />
            <PriorityRow
              label="Unassigned tickets"
              value={overview.tickets.unassignedCount}
              tone={overview.tickets.unassignedCount > 0 ? 'amber' : 'emerald'}
              helper="Support tickets not yet assigned to an agent"
            />
            <Separator />
            <div className="rounded-2xl bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Clock3Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Operator note</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                In-app notifications stay durable even when push is disabled by user config, so moderation and join-state operations still leave an audit trail.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick access (existing) */}
      <section>
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Quick access</CardTitle>
            <CardDescription>
              Jump straight into the admin areas that matter most after reading the charts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {actionCards.map((card) => {
              const Icon = card.icon

              return (
                <Link
                  key={card.href}
                  to={card.href}
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{card.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-3">
                    <Badge variant="secondary" className="hidden rounded-full px-2.5 py-1 text-xs md:inline-flex">
                      {card.metric}
                    </Badge>
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function MetricPanel({
  title,
  value,
  helper,
  tone,
}: {
  title: string
  value: string
  helper: string
  tone: 'emerald' | 'sky' | 'violet' | 'rose' | 'amber'
}) {
  const toneClasses = {
    emerald: 'border-emerald-500/20 bg-emerald-500/6',
    sky: 'border-sky-500/20 bg-sky-500/6',
    violet: 'border-violet-500/20 bg-violet-500/6',
    rose: 'border-rose-500/20 bg-rose-500/6',
    amber: 'border-amber-500/20 bg-amber-500/6',
  }[tone]

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}

function PriorityRow({
  label,
  value,
  tone,
  helper,
}: {
  label: string
  value: number
  tone: 'emerald' | 'rose' | 'amber' | 'sky' | 'slate'
  helper: string
}) {
  const toneClass = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  }[tone]

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="space-y-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>
      <div className={`rounded-full px-3 py-1 text-sm font-semibold ${toneClass}`}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function LegendRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground">{value.toLocaleString()}</span>
    </div>
  )
}

export const Route = createFileRoute('/admin/dashboard/')({
  component: DashboardPage,
})

