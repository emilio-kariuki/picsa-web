'use client'

import { useDeferredValue, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { KPICard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function SectionLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-5" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
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
    queryKey: ['admin', 'payments', 'overview'],
    queryFn: () => performAuthenticatedRequest((token) => getAdminPaymentsOverview(token)),
  })

  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'payments', 'subscriptions', deferredSubscriptionSearch],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        listAdminPaymentSubscriptions(token, {
          page: 1,
          limit: PAGE_LIMIT,
          search: deferredSubscriptionSearch || undefined,
          sortBy: 'expiresAt',
          sortOrder: 'ASC',
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
        }),
      ),
  })

  const overview = overviewQuery.data?.data.overview

  const providerCards = useMemo(
    () => overview?.eventPasses.providerSplit ?? [],
    [overview?.eventPasses.providerSplit],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track recurring subscriptions, web event-pass purchases, and provider activity from one billing workspace."
        actions={
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
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="rounded-xl py-2.5">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl py-2.5">Subscriptions</TabsTrigger>
          <TabsTrigger value="event-passes" className="rounded-xl py-2.5">Event Pass Payments</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-xl py-2.5">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overviewQuery.isLoading ? (
            <SectionLoading label="Loading billing overview..." />
          ) : overviewQuery.isError || !overview ? (
            <EmptyState
              icon={<ShieldAlertIcon className="h-6 w-6" />}
              title="Unable to load overview"
              description={errorMessage(overviewQuery.error, 'Try refreshing in a moment.')}
            />
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-4">
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

              <div className="grid gap-4 xl:grid-cols-4">
                <KPICard
                  title="Event pass revenue"
                  value={formatCurrency(overview.eventPasses.grossRevenue)}
                  icon={<DollarSignIcon className="h-5 w-5" />}
                />
                <KPICard
                  title="Event pass purchases"
                  value={overview.eventPasses.totalPurchases}
                  icon={<PackageIcon className="h-5 w-5" />}
                />
                <KPICard
                  title="Available passes"
                  value={overview.eventPasses.availablePasses}
                  icon={<CreditCardIcon className="h-5 w-5" />}
                />
                <KPICard
                  title="Revoked passes"
                  value={overview.eventPasses.revokedPasses}
                  icon={<ShieldAlertIcon className="h-5 w-5" />}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {providerCards.map((provider) => (
                  <Card key={provider.provider}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{provider.provider}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(provider.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Successful purchases</span>
                        <span className="font-medium text-foreground">{provider.purchases}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <SectionLoading label="Loading subscriptions..." />
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
                <SectionLoading label="Loading event pass payments..." />
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
                <SectionLoading label="Loading billing transactions..." />
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
