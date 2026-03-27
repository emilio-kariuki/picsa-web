'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircleIcon,
  CreditCardIcon,
  DollarSignIcon,
  GlobeIcon,
  RefreshCwIcon,
  SearchIcon,
  SmartphoneIcon,
  TrendingDownIcon,
  UsersIcon,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/empty-state'
import { KPICard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  getAdminPaymentsOverview,
  listAdminPaymentSubscriptions,
  listAdminPaymentTransactions,
  type AdminPaymentBillingCadence,
  type AdminPaymentSubscription,
  type AdminPaymentSubscriptionStatus,
  type AdminPaymentTransaction,
  type AdminPaymentTransactionType,
} from '@/lib/admin-payments-api'
import { isAdminApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PAYMENTS_SUBSCRIPTIONS_QUERY_KEY = 'admin-payments-subscriptions'
const PAYMENTS_TRANSACTIONS_QUERY_KEY = 'admin-payments-transactions'
const PAYMENTS_OVERVIEW_QUERY_KEY = 'admin-payments-overview'
const PAYMENTS_PAGE_LIMIT = 100

const storeLabel: Record<string, string> = {
  app_store: 'App Store',
  play_store: 'Play Store',
  stripe: 'Stripe',
  promotional: 'Promo',
}

const subscriptionStatusStyle: Record<AdminPaymentSubscriptionStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  trial: 'bg-blue-100 text-blue-700',
  grace_period: 'bg-amber-100 text-amber-700',
  paused: 'bg-violet-100 text-violet-700',
  cancelled: 'bg-rose-100 text-rose-700',
  expired: 'bg-muted text-muted-foreground',
}

const subscriptionStatusLabel: Record<AdminPaymentSubscriptionStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  grace_period: 'Grace Period',
  paused: 'Paused',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

const cadenceLabel: Record<AdminPaymentBillingCadence, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  weekly: 'Weekly',
  lifetime: 'Lifetime',
  unknown: 'Unknown',
}

const transactionTypeStyle: Record<AdminPaymentTransactionType, string> = {
  initial_purchase: 'bg-emerald-100 text-emerald-700',
  renewal: 'bg-sky-100 text-sky-700',
  product_change: 'bg-violet-100 text-violet-700',
  cancellation: 'bg-rose-100 text-rose-700',
  refund: 'bg-orange-100 text-orange-700',
  other: 'bg-muted text-muted-foreground',
}

const transactionTypeLabel: Record<AdminPaymentTransactionType, string> = {
  initial_purchase: 'New Purchase',
  renewal: 'Renewal',
  product_change: 'Product Change',
  cancellation: 'Cancellation',
  refund: 'Refund',
  other: 'Other',
}

function storeIcon(store: string | null) {
  if (store === 'app_store' || store === 'play_store') {
    return <SmartphoneIcon className="h-3.5 w-3.5" />
  }

  return <GlobeIcon className="h-3.5 w-3.5" />
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NA'
  )
}

function formatDate(iso: string | null | undefined) {
  if (!iso) {
    return '—'
  }

  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) {
    return '—'
  }

  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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

function getErrorMessage(error: unknown, fallback: string) {
  if (isAdminApiError(error) || error instanceof Error) {
    return error.message
  }

  return fallback
}

function SubscriptionDetail({
  sub,
  open,
  onClose,
}: {
  sub: AdminPaymentSubscription | null
  open: boolean
  onClose: () => void
}) {
  if (!sub) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Subscription Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={sub.subscriberAvatar} />
              <AvatarFallback>{getInitials(sub.subscriberName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{sub.subscriberName}</p>
              <p className="truncate text-sm text-muted-foreground">{sub.subscriberEmail}</p>
              <p className="truncate text-xs text-muted-foreground">ID: {sub.subscriberId}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  subscriptionStatusStyle[sub.status],
                )}
              >
                {subscriptionStatusLabel[sub.status]}
              </span>
            </div>

            <div>
              <p className="text-muted-foreground">Store</p>
              <p className="mt-1 font-medium">{storeLabel[sub.store ?? ''] ?? 'Unknown'}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Product</p>
              <p className="mt-1 font-medium">{sub.productName}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Billing Period</p>
              <p className="mt-1 font-medium">{cadenceLabel[sub.periodType]}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="mt-1 font-medium">
                {sub.price == null ? 'Unavailable' : formatCurrency(sub.price, sub.currency ?? 'USD')}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Auto Renew</p>
              <p className="mt-1 font-medium">{sub.isAutoRenew ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Trial</p>
              <p className="mt-1 font-medium">{sub.isTrial ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Last Transaction</p>
              <p className="mt-1 font-medium">{sub.lastTransactionId ?? 'Not recorded yet'}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Started</span>
              <span className="text-right font-medium">{formatDate(sub.startedAt)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Renews</span>
              <span className="text-right font-medium">{formatDate(sub.renewsAt)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Expires</span>
              <span className="text-right font-medium">{formatDate(sub.expiresAt)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Last observed event</span>
              <span className="text-right font-medium">{formatDateTime(sub.lastTransactionAt)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function TransactionDetail({
  txn,
  open,
  onClose,
}: {
  txn: AdminPaymentTransaction | null
  open: boolean
  onClose: () => void
}) {
  if (!txn) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Transaction Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={txn.subscriberAvatar} />
              <AvatarFallback>{getInitials(txn.subscriberName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{txn.subscriberName}</p>
              <p className="truncate text-sm text-muted-foreground">{txn.subscriberEmail || 'No email on record'}</p>
              <p className="truncate text-xs text-muted-foreground">App user: {txn.appUserId ?? 'Unknown'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="mt-1 break-all font-mono text-xs">{txn.transactionId}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Type</p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  transactionTypeStyle[txn.type],
                )}
              >
                {transactionTypeLabel[txn.type]}
              </span>
            </div>

            <div>
              <p className="text-muted-foreground">Store</p>
              <p className="mt-1 font-medium">{storeLabel[txn.store ?? ''] ?? 'Unknown'}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Product</p>
              <p className="mt-1 font-medium">{txn.productName}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Webhook Event</p>
              <p className="mt-1 font-medium">{txn.eventType}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="mt-1 font-medium">{txn.currency ?? 'Unknown'}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Gross Revenue</span>
              <span
                className={cn(
                  'text-right font-semibold tabular-nums',
                  (txn.amount ?? 0) < 0 && 'text-red-600',
                )}
              >
                {txn.amount == null ? '—' : formatCurrency(txn.amount, txn.currency ?? 'USD')}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Net Revenue</span>
              <span
                className={cn(
                  'text-right font-semibold tabular-nums',
                  (txn.revenueNet ?? 0) < 0
                    ? 'text-red-600'
                    : (txn.revenueNet ?? 0) > 0
                      ? 'text-emerald-600'
                      : '',
                )}
              >
                {txn.revenueNet == null ? '—' : formatCurrency(txn.revenueNet, txn.currency ?? 'USD')}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Recorded</span>
              <span className="text-right font-medium">{formatDateTime(txn.createdAt)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function PaymentsPage() {
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()

  const [subSearch, setSubSearch] = useState('')
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | AdminPaymentSubscriptionStatus>('all')
  const [subStoreFilter, setSubStoreFilter] = useState<'all' | string>('all')
  const [selectedSub, setSelectedSub] = useState<AdminPaymentSubscription | null>(null)

  const [txnSearch, setTxnSearch] = useState('')
  const [txnTypeFilter, setTxnTypeFilter] = useState<'all' | AdminPaymentTransactionType>('all')
  const [txnStoreFilter, setTxnStoreFilter] = useState<'all' | string>('all')
  const [selectedTxn, setSelectedTxn] = useState<AdminPaymentTransaction | null>(null)

  const deferredSubSearch = useDeferredValue(subSearch.trim())
  const deferredTxnSearch = useDeferredValue(txnSearch.trim())

  const subscriptionsQuery = useQuery({
    queryKey: [PAYMENTS_SUBSCRIPTIONS_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminPaymentSubscriptions(accessToken, {
          page: 1,
          limit: PAYMENTS_PAGE_LIMIT,
          sortBy: 'expiresAt',
          sortOrder: 'ASC',
        }),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const transactionsQuery = useQuery({
    queryKey: [PAYMENTS_TRANSACTIONS_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminPaymentTransactions(accessToken, {
          page: 1,
          limit: PAYMENTS_PAGE_LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const overviewQuery = useQuery({
    queryKey: [PAYMENTS_OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminPaymentsOverview(accessToken),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const subscriptions = subscriptionsQuery.data?.data.items ?? []
  const transactions = transactionsQuery.data?.data.items ?? []
  const overview = overviewQuery.data?.data.overview

  const filteredSubs = useMemo(() => {
    const normalizedSearch = deferredSubSearch.toLowerCase()

    return subscriptions.filter((sub) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        sub.subscriberName.toLowerCase().includes(normalizedSearch) ||
        sub.subscriberEmail.toLowerCase().includes(normalizedSearch) ||
        sub.productName.toLowerCase().includes(normalizedSearch) ||
        (sub.productId ?? '').toLowerCase().includes(normalizedSearch)
      const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter
      const matchesStore = subStoreFilter === 'all' || sub.store === subStoreFilter

      return matchesSearch && matchesStatus && matchesStore
    })
  }, [deferredSubSearch, subStatusFilter, subStoreFilter, subscriptions])

  const filteredTxns = useMemo(() => {
    const normalizedSearch = deferredTxnSearch.toLowerCase()

    return transactions.filter((txn) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        txn.subscriberName.toLowerCase().includes(normalizedSearch) ||
        txn.subscriberEmail.toLowerCase().includes(normalizedSearch) ||
        txn.transactionId.toLowerCase().includes(normalizedSearch) ||
        (txn.appUserId ?? '').toLowerCase().includes(normalizedSearch) ||
        txn.productName.toLowerCase().includes(normalizedSearch)
      const matchesType = txnTypeFilter === 'all' || txn.type === txnTypeFilter
      const matchesStore = txnStoreFilter === 'all' || txn.store === txnStoreFilter

      return matchesSearch && matchesType && matchesStore
    })
  }, [deferredTxnSearch, transactions, txnStoreFilter, txnTypeFilter])

  const refreshPayments = async () => {
    try {
      await Promise.all([
        subscriptionsQuery.refetch(),
        transactionsQuery.refetch(),
        overviewQuery.refetch(),
      ])
      toast.success('Payments data refreshed')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to refresh payments data'))
    }
  }

  const hasAnyError =
    subscriptionsQuery.isError || transactionsQuery.isError || overviewQuery.isError

  const chartData = overview?.mrrSeries ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor live RevenueCat subscription activity, recurring revenue estimates, and recorded webhook transactions."
        actions={(
          <Button
            variant="outline"
            onClick={() => void refreshPayments()}
            disabled={
              subscriptionsQuery.isFetching ||
              transactionsQuery.isFetching ||
              overviewQuery.isFetching
            }
          >
            <RefreshCwIcon
              className={cn(
                'mr-2 h-4 w-4',
                (subscriptionsQuery.isFetching ||
                  transactionsQuery.isFetching ||
                  overviewQuery.isFetching) && 'animate-spin',
              )}
            />
            Refresh
          </Button>
        )}
      />

      {hasAnyError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircleIcon className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-destructive">Some payments data could not be loaded.</p>
              <p className="text-muted-foreground">
                {getErrorMessage(
                  subscriptionsQuery.error ?? transactionsQuery.error ?? overviewQuery.error,
                  'A live billing endpoint returned an error.',
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly Recurring Revenue"
          value={overview ? formatCurrency(overview.mrr) : '—'}
          change={overview?.mrrChange}
          icon={<DollarSignIcon className="h-5 w-5 text-emerald-700" />}
          className="border-emerald-200/70 bg-emerald-50/40"
        />
        <KPICard
          title="Active Subscribers"
          value={overview?.activeSubscriptions ?? '—'}
          change={overview?.activeSubscriptionsChange}
          icon={<UsersIcon className="h-5 w-5 text-sky-700" />}
          className="border-sky-200/70 bg-sky-50/40"
        />
        <KPICard
          title="Active Trials"
          value={overview?.trials ?? '—'}
          change={overview?.trialsChange}
          icon={<CreditCardIcon className="h-5 w-5 text-blue-700" />}
          className="border-blue-200/70 bg-blue-50/40"
        />
        <KPICard
          title="Churn Rate"
          value={overview ? `${overview.churnRate}%` : '—'}
          change={overview?.churnRateChange}
          icon={<TrendingDownIcon className="h-5 w-5 text-rose-700" />}
          className="border-rose-200/70 bg-rose-50/40"
        />
      </div>

      <Card className="overflow-hidden border-border/70">
        <CardHeader className="gap-4 border-b border-border/70 bg-muted/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>MRR Trend</CardTitle>
              <CardDescription>
                Estimated from active entitlements and recorded RevenueCat transaction history.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Live API</Badge>
              <Badge variant="secondary">
                {subscriptionsQuery.data?.data.totalCount ?? 0} subscription records
              </Badge>
              <Badge variant="secondary">
                {transactionsQuery.data?.data.totalCount ?? 0} transaction events
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {overviewQuery.isLoading ? (
            <div className="flex h-[220px] flex-col items-center justify-center gap-3 text-center">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">Loading revenue trend...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Estimated MRR']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.25}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subscriber or product..."
                className="pl-9"
                value={subSearch}
                onChange={(event) => setSubSearch(event.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={subStatusFilter} onValueChange={(value) => setSubStatusFilter(value as 'all' | AdminPaymentSubscriptionStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="grace_period">Grace Period</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subStoreFilter} onValueChange={setSubStoreFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="app_store">App Store</SelectItem>
                  <SelectItem value="play_store">Play Store</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="promotional">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 bg-muted/10 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Live Subscriber Records</CardTitle>
                  <CardDescription>
                    Active and historical subscription snapshots from the admin API.
                  </CardDescription>
                </div>
                <Badge variant="outline">{filteredSubs.length} shown</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {subscriptionsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Spinner className="size-6" />
                  <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
                </div>
              ) : filteredSubs.length === 0 ? (
                <EmptyState
                  className="py-16"
                  icon={<UsersIcon className="h-6 w-6" />}
                  title={subscriptions.length === 0 ? 'No live subscriptions yet' : 'No subscriptions match this view'}
                  description={
                    subscriptions.length === 0
                      ? 'The page is using the live billing API. Subscription records will show up here after RevenueCat syncs create customer and entitlement snapshots.'
                      : 'Try a broader search or reset the filters to bring more subscriber records into view.'
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Renews / Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubs.map((sub) => (
                      <TableRow
                        key={sub.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => setSelectedSub(sub)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={sub.subscriberAvatar} />
                              <AvatarFallback>{getInitials(sub.subscriberName)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{sub.subscriberName}</p>
                              <p className="truncate text-xs text-muted-foreground">{sub.subscriberEmail || 'No email on record'}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{sub.productName}</p>
                            {sub.isTrial && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                Trial
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {storeIcon(sub.store)}
                            {storeLabel[sub.store ?? ''] ?? 'Unknown'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                              subscriptionStatusStyle[sub.status],
                            )}
                          >
                            {subscriptionStatusLabel[sub.status]}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm">{cadenceLabel[sub.periodType]}</TableCell>

                        <TableCell className="text-right font-medium tabular-nums">
                          {sub.price == null ? '—' : formatCurrency(sub.price, sub.currency ?? 'USD')}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {sub.renewsAt ? formatDate(sub.renewsAt) : formatDate(sub.expiresAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subscriber or transaction ID..."
                className="pl-9"
                value={txnSearch}
                onChange={(event) => setTxnSearch(event.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={txnTypeFilter} onValueChange={(value) => setTxnTypeFilter(value as 'all' | AdminPaymentTransactionType)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="initial_purchase">New Purchase</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="product_change">Product Change</SelectItem>
                  <SelectItem value="cancellation">Cancellation</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={txnStoreFilter} onValueChange={setTxnStoreFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="app_store">App Store</SelectItem>
                  <SelectItem value="play_store">Play Store</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="promotional">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 bg-muted/10 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Recorded Transactions</CardTitle>
                  <CardDescription>
                    RevenueCat webhook events normalized into a readable billing timeline.
                  </CardDescription>
                </div>
                <Badge variant="outline">{filteredTxns.length} shown</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {transactionsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Spinner className="size-6" />
                  <p className="text-sm text-muted-foreground">Loading transactions...</p>
                </div>
              ) : filteredTxns.length === 0 ? (
                <EmptyState
                  className="py-16"
                  icon={<CreditCardIcon className="h-6 w-6" />}
                  title={transactions.length === 0 ? 'No live transactions yet' : 'No transactions match this view'}
                  description={
                    transactions.length === 0
                      ? 'No RevenueCat webhook events have been recorded yet, so the live transaction feed is currently empty.'
                      : 'Try a broader search or change the filters to inspect a wider set of billing events.'
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTxns.map((txn) => (
                      <TableRow
                        key={txn.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => setSelectedTxn(txn)}
                      >
                        <TableCell className="font-mono text-xs">
                          {txn.transactionId.length > 12 ? txn.transactionId.slice(-12) : txn.transactionId}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={txn.subscriberAvatar} />
                              <AvatarFallback>{getInitials(txn.subscriberName)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{txn.subscriberName}</p>
                              <p className="truncate text-xs text-muted-foreground">{txn.subscriberEmail || txn.appUserId || 'Unknown subscriber'}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm">{txn.productName}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {storeIcon(txn.store)}
                            {storeLabel[txn.store ?? ''] ?? 'Unknown'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                              transactionTypeStyle[txn.type],
                            )}
                          >
                            {transactionTypeLabel[txn.type]}
                          </span>
                        </TableCell>

                        <TableCell
                          className={cn(
                            'text-right font-medium tabular-nums',
                            (txn.amount ?? 0) < 0 && 'text-red-600',
                          )}
                        >
                          {txn.amount == null ? '—' : formatCurrency(txn.amount, txn.currency ?? 'USD')}
                        </TableCell>

                        <TableCell
                          className={cn(
                            'text-right font-medium tabular-nums',
                            (txn.revenueNet ?? 0) < 0
                              ? 'text-red-600'
                              : (txn.revenueNet ?? 0) > 0
                                ? 'text-emerald-600'
                                : '',
                          )}
                        >
                          {txn.revenueNet == null ? '—' : formatCurrency(txn.revenueNet, txn.currency ?? 'USD')}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(txn.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SubscriptionDetail
        sub={selectedSub}
        open={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
      />
      <TransactionDetail
        txn={selectedTxn}
        open={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  )
}
