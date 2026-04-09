'use client'

import { useDeferredValue, useMemo, useState } from 'react'
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
import { useQuery } from '@tanstack/react-query'
import {
  CreditCardIcon,
  DollarSignIcon,
  HistoryIcon,
  PackageIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  SmartphoneIcon,
  TriangleAlertIcon,
} from '@/components/ui/icons'
import { EmptyState } from '@/components/common/empty-state'
import { KPICard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  getAdminPaymentsOverview,
  listAdminBillingTransactions,
  listAdminEventPassPayments,
  listAdminPaymentSubscriptions,
  type AdminBillingProvider,
  type AdminBillingTransaction,
  type AdminBillingTransactionType,
  type AdminEventPassPayment,
  type AdminPaymentSubscription,
  type AdminPaymentSubscriptionStatus,
} from '@/lib/admin-payments-api'
import { isAdminApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const PAGE_LIMIT = 100

const chartColors = {
  violet: 'var(--chart-5)',
  indigo: 'var(--chart-1)',
  sky: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  emerald: 'var(--chart-1)',
}

const mrrChartConfig = {
  mrr: { label: 'MRR', color: chartColors.violet },
} satisfies ChartConfig

const providerChartConfig = {
  DODO: { label: 'Dodo', color: chartColors.indigo },
  REVENUECAT: { label: 'RevenueCat', color: chartColors.sky },
} satisfies ChartConfig

const passesDonutConfig = {
  available: { label: 'Available', color: chartColors.emerald },
  claimed: { label: 'Claimed', color: chartColors.sky },
  revoked: { label: 'Revoked', color: chartColors.amber },
} satisfies ChartConfig

const DONUT_COLORS = [chartColors.emerald, chartColors.sky, chartColors.amber]

function formatCurrency(amount: number | null | undefined, currency = 'USD') {
  if (amount == null) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function storeLabel(store: string | null) {
  switch (store) {
    case 'app_store':
      return 'App Store'
    case 'play_store':
      return 'Play Store'
    case 'dodo':
      return 'Dodo'
    default:
      return store ?? '—'
  }
}

function transactionLabel(type: AdminBillingTransactionType) {
  switch (type) {
    case 'event_pass_purchase':
      return 'Event pass purchase'
    case 'event_pass_refund':
      return 'Event pass refund'
    case 'event_pass_dispute':
      return 'Event pass dispute'
    case 'initial_purchase':
      return 'New subscription'
    case 'product_change':
      return 'Plan change'
    default:
      return type.replaceAll('_', ' ')
  }
}

function subscriptionStatusClass(status: AdminPaymentSubscriptionStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700'
    case 'trial':
      return 'bg-sky-100 text-sky-700'
    case 'grace_period':
      return 'bg-amber-100 text-amber-700'
    case 'paused':
      return 'bg-violet-100 text-violet-700'
    case 'cancelled':
      return 'bg-rose-100 text-rose-700'
    case 'expired':
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function providerBadgeClass(provider: AdminBillingProvider) {
  return provider === 'DODO'
    ? 'bg-indigo-100 text-indigo-700'
    : 'bg-sky-100 text-sky-700'
}

function paymentStatusClass(status: string | null) {
  switch (status) {
    case 'succeeded':
      return 'bg-emerald-100 text-emerald-700'
    case 'refunded':
      return 'bg-amber-100 text-amber-700'
    case 'failed':
    case 'cancelled':
    case 'dispute_opened':
    case 'dispute_accepted':
    case 'dispute_lost':
      return 'bg-rose-100 text-rose-700'
    case 'processing':
    case 'pending':
      return 'bg-sky-100 text-sky-700'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function errorMessage(error: unknown, fallback: string) {
  if (isAdminApiError(error) || error instanceof Error) {
    return error.message
  }

  return fallback
}

function SectionLoading() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-40 flex-1" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      ))}
    </div>
  )
}

function EmptyTable({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <EmptyState
      icon={<PackageIcon className="h-6 w-6" />}
      title={title}
      description={description}
      className="py-20"
    />
  )
}

function SubscriptionsTable({ items }: { items: AdminPaymentSubscription[] }) {
  if (!items.length) {
    return (
      <EmptyTable
        title="No subscriptions found"
        description="Try widening the filter or search term."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/70">
          <TableHead>Subscriber</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Store</TableHead>
          <TableHead>Renews / Expires</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="border-border/60">
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{item.subscriberName}</p>
                <p className="text-sm text-muted-foreground">{item.subscriberEmail}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{item.productName}</p>
                <p className="text-sm text-muted-foreground">{item.productId ?? 'No product id'}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={cn('rounded-full', subscriptionStatusClass(item.status))}>
                {item.status.replaceAll('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>{storeLabel(item.store)}</TableCell>
            <TableCell>{formatDate(item.renewsAt ?? item.expiresAt)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.price, item.currency ?? 'USD')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EventPassPaymentsTable({ items }: { items: AdminEventPassPayment[] }) {
  if (!items.length) {
    return (
      <EmptyTable
        title="No event pass payments yet"
        description="Dodo web checkouts and RevenueCat event passes will show up here."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/70">
          <TableHead>Customer</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Purchased</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="border-border/60">
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{item.user.name}</p>
                <p className="text-sm text-muted-foreground">{item.user.email}</p>
                <p className="text-xs text-muted-foreground">{item.paymentId ?? item.transactionId}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={cn('rounded-full', providerBadgeClass(item.provider))}>
                {item.provider}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <Badge className={cn('rounded-full', paymentStatusClass(item.paymentStatus))}>
                  {item.paymentStatus?.replaceAll('_', ' ') ?? 'unknown'}
                </Badge>
                {item.isRevoked ? (
                  <p className="text-xs text-rose-600 dark:text-rose-300">
                    Revoked: {item.revocationReason ?? 'provider reversal'}
                  </p>
                ) : item.isClaimed ? (
                  <p className="text-xs text-muted-foreground">Claimed to event</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Available pass</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              {item.event ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{item.event.name}</p>
                  <p className="text-sm text-muted-foreground">{item.event.url}</p>
                </div>
              ) : (
                <span className="text-muted-foreground">Unclaimed</span>
              )}
            </TableCell>
            <TableCell>{formatDateTime(item.purchasedAt)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.amount, item.currency ?? 'USD')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function TransactionsTable({ items }: { items: AdminBillingTransaction[] }) {
  if (!items.length) {
    return (
      <EmptyTable
        title="No billing transactions found"
        description="Try another provider or transaction type."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/70">
          <TableHead>When</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="border-border/60">
            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{transactionLabel(item.type)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.eventName ?? item.productName ?? item.eventType ?? 'Billing event'}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={cn('rounded-full', providerBadgeClass(item.provider))}>
                {item.provider}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{item.subscriber.name}</p>
                <p className="text-sm text-muted-foreground">{item.subscriber.email}</p>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {item.paymentId ?? item.transactionId ?? item.checkoutSessionId ?? '—'}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.amount, item.currency ?? 'USD')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AdminPaymentsPage() {
  const { performAuthenticatedRequest } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSandbox, setIsSandbox] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem('payments-sandbox-mode')
    return stored === null ? true : stored === 'true'
  })

  function toggleSandbox(checked: boolean) {
    setIsSandbox(checked)
    localStorage.setItem('payments-sandbox-mode', String(checked))
  }

  const [subscriptionSearch, setSubscriptionSearch] = useState('')
  const deferredSubscriptionSearch = useDeferredValue(subscriptionSearch)

  const [eventPassSearch, setEventPassSearch] = useState('')
  const [eventPassProvider, setEventPassProvider] = useState<'all' | AdminBillingProvider>('all')
  const [eventPassStatus, setEventPassStatus] = useState('all')
  const deferredEventPassSearch = useDeferredValue(eventPassSearch)

  const [transactionSearch, setTransactionSearch] = useState('')
  const [transactionProvider, setTransactionProvider] = useState<'all' | AdminBillingProvider>('all')
  const [transactionType, setTransactionType] = useState<'all' | AdminBillingTransactionType>('all')
  const deferredTransactionSearch = useDeferredValue(transactionSearch)

  const overviewQuery = useQuery({
    queryKey: ['admin', 'payments', 'overview', isSandbox],
    queryFn: () => performAuthenticatedRequest((token) => getAdminPaymentsOverview(token, isSandbox)),
  })

  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'payments', 'subscriptions', deferredSubscriptionSearch, isSandbox],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        listAdminPaymentSubscriptions(token, {
          page: 1,
          limit: PAGE_LIMIT,
          search: deferredSubscriptionSearch || undefined,
          sortBy: 'expiresAt',
          sortOrder: 'ASC',
          isSandbox,
        }),
      ),
  })

  const eventPassesQuery = useQuery({
    queryKey: [
      'admin',
      'payments',
      'event-pass-purchases',
      deferredEventPassSearch,
      eventPassProvider,
      eventPassStatus,
      isSandbox,
    ],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        listAdminEventPassPayments(token, {
          page: 1,
          limit: PAGE_LIMIT,
          search: deferredEventPassSearch || undefined,
          sortBy: 'purchasedAt',
          sortOrder: 'DESC',
          provider: eventPassProvider === 'all' ? undefined : eventPassProvider,
          paymentStatus: eventPassStatus === 'all' ? undefined : eventPassStatus,
          isSandbox,
        }),
      ),
  })

  const transactionsQuery = useQuery({
    queryKey: [
      'admin',
      'payments',
      'transactions',
      deferredTransactionSearch,
      transactionProvider,
      transactionType,
      isSandbox,
    ],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        listAdminBillingTransactions(token, {
          page: 1,
          limit: PAGE_LIMIT,
          search: deferredTransactionSearch || undefined,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          provider: transactionProvider === 'all' ? undefined : transactionProvider,
          type: transactionType === 'all' ? undefined : transactionType,
          isSandbox,
        }),
      ),
  })

  const overview = overviewQuery.data?.data.overview

  const providerCards = useMemo(
    () => overview?.eventPasses.providerSplit ?? [],
    [overview?.eventPasses.providerSplit],
  )

  const providerBarData = useMemo(
    () =>
      providerCards.map((p) => ({
        provider: p.provider,
        revenue: p.revenue / 100,
        purchases: p.purchases,
      })),
    [providerCards],
  )

  const passesDonutData = useMemo(() => {
    if (!overview) return []
    return [
      { name: 'Available', value: overview.eventPasses.availablePasses },
      { name: 'Claimed', value: overview.eventPasses.claimedPasses },
      { name: 'Revoked', value: overview.eventPasses.revokedPasses },
    ].filter((d) => d.value > 0)
  }, [overview])

  const mrrSeriesFormatted = useMemo(
    () =>
      overview?.subscriptions.mrrSeries.map((p) => ({
        month: p.month,
        mrr: p.mrr / 100,
      })) ?? [],
    [overview?.subscriptions.mrrSeries],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track recurring subscriptions, web event-pass purchases, and provider activity from one billing workspace."
        actions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="sandbox-toggle"
                checked={isSandbox}
                onCheckedChange={toggleSandbox}
              />
              <Label
                htmlFor="sandbox-toggle"
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 text-sm font-medium',
                  isSandbox ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                )}
              >
                <TriangleAlertIcon className="h-4 w-4" />
                {isSandbox ? 'Test mode' : 'Live mode'}
              </Label>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                void overviewQuery.refetch()
                void subscriptionsQuery.refetch()
                void eventPassesQuery.refetch()
                void transactionsQuery.refetch()
              }}
            >
              <RefreshCwIcon className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {isSandbox && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <TriangleAlertIcon className="h-4 w-4 shrink-0" />
          Showing sandbox / test payments only. Toggle off to see live data.
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="rounded-xl py-2.5">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl py-2.5">Subscriptions</TabsTrigger>
          <TabsTrigger value="event-passes" className="rounded-xl py-2.5">Event Pass Payments</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-xl py-2.5">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overviewQuery.isLoading ? (
            <div className="space-y-6">
              {/* KPI skeleton */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-5 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Chart skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-52" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[280px] w-full rounded-lg" />
                </CardContent>
              </Card>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3 w-56" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[240px] w-full rounded-lg" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-48" />
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <Skeleton className="h-[200px] w-[200px] rounded-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : overviewQuery.isError || !overview ? (
            <EmptyState
              icon={<ShieldAlertIcon className="h-6 w-6" />}
              title="Unable to load overview"
              description={errorMessage(overviewQuery.error, 'Try refreshing in a moment.')}
            />
          ) : (
            <>
              {/* Hero KPI row */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KPICard
                  title="MRR"
                  value={formatCurrency(overview.subscriptions.mrr)}
                  change={overview.subscriptions.mrrChange}
                  icon={<DollarSignIcon className="h-5 w-5" />}
                />
                <KPICard
                  title="Active subscriptions"
                  value={overview.subscriptions.activeSubscriptions}
                  change={overview.subscriptions.activeSubscriptionsChange}
                  icon={<CreditCardIcon className="h-5 w-5" />}
                />
                <KPICard
                  title="Trials"
                  value={overview.subscriptions.trials}
                  change={overview.subscriptions.trialsChange}
                  icon={<SmartphoneIcon className="h-5 w-5" />}
                />
                <KPICard
                  title="Churn rate"
                  value={`${overview.subscriptions.churnRate.toFixed(1)}%`}
                  change={overview.subscriptions.churnRateChange}
                  icon={<HistoryIcon className="h-5 w-5" />}
                />
              </div>

              {/* MRR trend chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">MRR trend</CardTitle>
                  <CardDescription>Monthly recurring revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {mrrSeriesFormatted.length > 0 ? (
                    <ChartContainer config={mrrChartConfig} className="h-[280px] w-full">
                      <AreaChart
                        data={mrrSeriesFormatted}
                        accessibilityLayer
                        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="fillMrr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.violet} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColors.violet} stopOpacity={0} />
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
                          stroke={chartColors.violet}
                          fill="url(#fillMrr)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <p className="py-10 text-center text-sm text-muted-foreground">No MRR data available yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Event passes row */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Provider revenue bar chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue by provider</CardTitle>
                    <CardDescription>Event pass revenue split across payment providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {providerBarData.length > 0 ? (
                      <ChartContainer config={providerChartConfig} className="h-[240px] w-full">
                        <BarChart
                          data={providerBarData}
                          accessibilityLayer
                          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="provider" tickLine={false} axisLine={false} tickMargin={10} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v) => `$${v}`} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                labelKey="provider"
                                formatter={(value) => `$${Number(value).toLocaleString()}`}
                              />
                            }
                          />
                          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                            {providerBarData.map((entry) => (
                              <Cell
                                key={entry.provider}
                                fill={entry.provider === 'DODO' ? chartColors.indigo : chartColors.sky}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <p className="py-10 text-center text-sm text-muted-foreground">No provider data yet.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Passes breakdown donut */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Event pass breakdown</CardTitle>
                    <CardDescription>
                      {overview.eventPasses.totalPurchases.toLocaleString()} total purchases &middot;{' '}
                      {formatCurrency(overview.eventPasses.grossRevenue)} gross revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    {passesDonutData.length > 0 ? (
                      <div className="flex flex-col items-center gap-4">
                        <ChartContainer config={passesDonutConfig} className="h-[200px] w-[200px]">
                          <PieChart>
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value) => Number(value).toLocaleString()}
                                />
                              }
                            />
                            <Pie
                              data={passesDonutData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                              strokeWidth={0}
                            >
                              {passesDonutData.map((_, i) => (
                                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                        <div className="flex gap-4 text-sm">
                          {passesDonutData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                              />
                              <span className="text-muted-foreground">{d.name}</span>
                              <span className="font-medium">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="py-10 text-center text-sm text-muted-foreground">No pass data yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={subscriptionSearch}
                onChange={(event) => setSubscriptionSearch(event.target.value)}
                placeholder="Search subscriber email or name"
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {subscriptionsQuery.data?.data.totalCount ?? 0} recurring subscriptions
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              {subscriptionsQuery.isLoading ? (
                <SectionLoading />
              ) : subscriptionsQuery.isError ? (
                <EmptyState
                  icon={<ShieldAlertIcon className="h-6 w-6" />}
                  title="Unable to load subscriptions"
                  description={errorMessage(subscriptionsQuery.error, 'Try again in a moment.')}
                />
              ) : (
                <SubscriptionsTable items={subscriptionsQuery.data?.data.items ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="event-passes" className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={eventPassSearch}
                onChange={(event) => setEventPassSearch(event.target.value)}
                placeholder="Search customer, event, payment id, or checkout"
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={eventPassProvider} onValueChange={(value) => setEventPassProvider(value as 'all' | AdminBillingProvider)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  <SelectItem value="REVENUECAT">RevenueCat</SelectItem>
                  <SelectItem value="DODO">Dodo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eventPassStatus} onValueChange={setEventPassStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="dispute_opened">Dispute opened</SelectItem>
                  <SelectItem value="dispute_accepted">Dispute accepted</SelectItem>
                  <SelectItem value="dispute_lost">Dispute lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {eventPassesQuery.isLoading ? (
                <SectionLoading />
              ) : eventPassesQuery.isError ? (
                <EmptyState
                  icon={<ShieldAlertIcon className="h-6 w-6" />}
                  title="Unable to load event pass payments"
                  description={errorMessage(eventPassesQuery.error, 'Try again in a moment.')}
                />
              ) : (
                <EventPassPaymentsTable items={eventPassesQuery.data?.data.items ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={transactionSearch}
                onChange={(event) => setTransactionSearch(event.target.value)}
                placeholder="Search customer, product, payment id, or event"
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={transactionProvider} onValueChange={(value) => setTransactionProvider(value as 'all' | AdminBillingProvider)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  <SelectItem value="REVENUECAT">RevenueCat</SelectItem>
                  <SelectItem value="DODO">Dodo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={transactionType} onValueChange={(value) => setTransactionType(value as 'all' | AdminBillingTransactionType)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All transaction types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All transaction types</SelectItem>
                  <SelectItem value="initial_purchase">New subscription</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="event_pass_purchase">Event pass purchase</SelectItem>
                  <SelectItem value="event_pass_refund">Event pass refund</SelectItem>
                  <SelectItem value="event_pass_dispute">Event pass dispute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {transactionsQuery.isLoading ? (
                <SectionLoading />
              ) : transactionsQuery.isError ? (
                <EmptyState
                  icon={<ShieldAlertIcon className="h-6 w-6" />}
                  title="Unable to load billing transactions"
                  description={errorMessage(transactionsQuery.error, 'Try again in a moment.')}
                />
              ) : (
                <TransactionsTable items={transactionsQuery.data?.data.items ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
