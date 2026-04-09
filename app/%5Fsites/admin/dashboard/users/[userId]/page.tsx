'use client'

import Link from 'next/link'
import { use, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  BellRingIcon,
  CalendarDaysIcon,
  CameraIcon,
  CreditCardIcon,
  ImageIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  UserCogIcon,
  UsersIcon,
} from '@/components/ui/icons'
import { Cell, Pie, PieChart } from 'recharts'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  type AdminUserDetail,
  getAdminUserById,
  syncAdminUserSubscription,
} from '@/lib/admin-users-api'
import {
  listAdminBillingTransactions,
  listAdminEventPassPayments,
  type AdminBillingTransaction,
  type AdminEventPassPayment,
} from '@/lib/admin-payments-api'
import { isAdminApiError } from '@/lib/api'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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

const USER_QUERY_KEY = 'admin-user'

const activityChartConfig = {
  hostedEvents: { label: 'Hosted', color: 'var(--chart-1)' },
  joinedEvents: { label: 'Joined', color: 'var(--chart-2)' },
  images: { label: 'Images', color: 'var(--chart-3)' },
  notifications: { label: 'Unread', color: 'var(--chart-5)' },
} satisfies ChartConfig

const ACTIVITY_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-5)']

function formatDateTime(value: string | null) {
  if (!value) return 'Never'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUserDisplayName(user: { name: string | null; email: string | null }) {
  const name = user.name?.trim()
  if (name) return name
  return user.email?.split('@')[0] ?? 'Unnamed User'
}

function getUserInitials(user: { name: string | null; email: string | null }) {
  const displayName = getUserDisplayName(user)
  const parts = displayName.split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U'
}

function storeLabel(store: string | null) {
  switch (store) {
    case 'app_store':
      return 'App Store'
    case 'play_store':
      return 'Play Store'
    case 'stripe':
      return 'Stripe'
    default:
      return store ?? 'Unknown'
  }
}

interface UserDetailPageProps {
  params: Promise<{ userId: string }>
}

export default function UserDetailPage(props: UserDetailPageProps) {
  const { userId } = use(props.params)
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()

  const userQuery = useQuery({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: () =>
      performAuthenticatedRequest((token) => getAdminUserById(token, userId)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const syncMutation = useMutation({
    mutationFn: () =>
      performAuthenticatedRequest((token) => syncAdminUserSubscription(token, userId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] })
      toast.success('Subscription synced')
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to sync subscription'
      toast.error(message)
    },
  })

  const user = userQuery.data?.data.user ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        title={user ? getUserDisplayName(user) : 'User details'}
        description={user?.email ?? 'Loading user profile...'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/users">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to users
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => void userQuery.refetch()}
              disabled={userQuery.isFetching}
            >
              {userQuery.isFetching ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <RefreshCwIcon className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        }
      />

      {userQuery.isLoading ? (
        <div className="space-y-6">
          {/* Profile hero skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Separator />
                  <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Metric cards skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-5">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Charts row skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-64" />
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : userQuery.isError ? (
        <Card>
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load user</h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminApiError(userQuery.error) || userQuery.error instanceof Error
                    ? userQuery.error.message
                    : 'Something went wrong while loading this user.'}
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/users">Return to users</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : user ? (
        <UserDetailContent user={user} userId={userId} onSync={() => syncMutation.mutate()} isSyncing={syncMutation.isPending} />
      ) : null}
    </div>
  )
}

function UserDetailContent({
  user,
  userId,
  onSync,
  isSyncing,
}: {
  user: AdminUserDetail
  userId: string
  onSync: () => void
  isSyncing: boolean
}) {
  const { performAuthenticatedRequest } = useAdminAuth()
  const [paymentsTab, setPaymentsTab] = useState('transactions')
  const activityData = useMemo(() => {
    return [
      { name: 'Hosted', value: user.counts.hostedEventsCount },
      { name: 'Joined', value: user.counts.memberEventsCount },
      { name: 'Images', value: user.counts.imageCount },
      { name: 'Unread', value: user.counts.unreadNotificationCount },
    ].filter((d) => d.value > 0)
  }, [user.counts])

  const totalActivity =
    user.counts.hostedEventsCount +
    user.counts.memberEventsCount +
    user.counts.imageCount +
    user.counts.unreadNotificationCount

  const transactionsQuery = useQuery({
    queryKey: ['admin', 'user-transactions', userId],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        listAdminBillingTransactions(token, {
          page: 1,
          limit: 50,
          userId,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }),
      ),
  })

  const eventPassesQuery = useQuery({
    queryKey: ['admin', 'user-event-passes', userId],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        listAdminEventPassPayments(token, {
          page: 1,
          limit: 50,
          userId,
          sortBy: 'purchasedAt',
          sortOrder: 'DESC',
        }),
      ),
  })

  const transactions = transactionsQuery.data?.data.items ?? []
  const eventPasses = eventPassesQuery.data?.data.items ?? []

  return (
    <div className="space-y-6">
      {/* Profile hero */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={user.url ?? undefined} />
              <AvatarFallback className="text-2xl">{getUserInitials(user)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">{getUserDisplayName(user)}</h2>
                  <Badge variant="secondary">{user.role === 'admin' ? 'Admin' : 'User'}</Badge>
                  {user.pro ? (
                    <Badge className="gap-1">
                      <SparklesIcon className="h-3.5 w-3.5" />
                      Pro
                    </Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                  <StatusBadge status={user.active ? 'active' : 'inactive'} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{user.email ?? 'No email address'}</p>
              </div>

              <Separator />

              <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last login</p>
                  <p className="font-medium">{formatDateTime(user.lastLoginAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email verified</p>
                  <p className="font-medium">
                    {user.emailVerifiedAt ? formatDateTime(user.emailVerifiedAt) : 'Not verified'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Auth providers</p>
                  <p className="font-medium">
                    {user.authProviders.length > 0 ? user.authProviders.join(', ') : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Hosted events"
          value={user.counts.hostedEventsCount}
          icon={<CalendarDaysIcon className="h-5 w-5" />}
        />
        <MetricCard
          title="Joined events"
          value={user.counts.memberEventsCount}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <MetricCard
          title="Images"
          value={user.counts.imageCount}
          icon={<ImageIcon className="h-5 w-5" />}
        />
        <MetricCard
          title="Unread notifications"
          value={user.counts.unreadNotificationCount}
          icon={<BellRingIcon className="h-5 w-5" />}
        />
      </div>

      {/* Charts + subscription row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity breakdown</CardTitle>
            <CardDescription>
              Events, images, and notifications for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {activityData.length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <ChartContainer config={activityChartConfig} className="h-[200px] w-[200px]">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => Number(value).toLocaleString()}
                        />
                      }
                    />
                    <Pie
                      data={activityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {activityData.map((_, i) => (
                        <Cell key={i} fill={ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  {activityData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ACTIVITY_COLORS[i % ACTIVITY_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{totalActivity} total items</p>
              </div>
            ) : (
              <p className="py-10 text-sm text-muted-foreground">No activity recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Subscription card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Subscription</CardTitle>
                <CardDescription>Mirrored RevenueCat state for this account</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onSync} disabled={isSyncing}>
                {isSyncing ? (
                  <Spinner className="mr-2 size-4" />
                ) : (
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                )}
                Sync
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <CreditCardIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">
                  {user.subscription.activeProductId ?? 'No active product'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.subscription.isPro ? 'Pro subscriber' : 'Free tier'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={<SmartphoneIcon className="h-4 w-4" />}
                label="Store"
                value={storeLabel(user.subscription.store)}
              />
              <InfoItem
                icon={<RefreshCwIcon className="h-4 w-4" />}
                label="Will renew"
                value={user.subscription.willRenew ? 'Yes' : 'No'}
              />
              <InfoItem
                icon={<CalendarDaysIcon className="h-4 w-4" />}
                label="Expires at"
                value={
                  user.subscription.expiresAt
                    ? formatDateTime(user.subscription.expiresAt)
                    : 'Not set'
                }
              />
              <InfoItem
                icon={<RefreshCwIcon className="h-4 w-4" />}
                label="Last synced"
                value={
                  user.subscription.lastSyncedAt
                    ? formatDateTime(user.subscription.lastSyncedAt)
                    : 'Never'
                }
              />
            </div>

            {user.subscription.activeEntitlementIds.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active entitlements</p>
                <div className="flex flex-wrap gap-2">
                  {user.subscription.activeEntitlementIds.map((id) => (
                    <Badge key={id} variant="secondary">{id}</Badge>
                  ))}
                </div>
              </div>
            )}

            {user.subscription.managementUrl && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={user.subscription.managementUrl} target="_blank" rel="noopener noreferrer">
                  <UserCogIcon className="mr-2 h-4 w-4" />
                  Manage in RevenueCat
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
          <CardDescription>Technical metadata and identifiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={<UserCogIcon className="h-4 w-4" />}
              label="Email"
              value={user.email ?? 'No email'}
            />
            <InfoItem
              icon={<ShieldCheckIcon className="h-4 w-4" />}
              label="Role"
              value={user.role === 'admin' ? 'Admin' : 'User'}
            />
            <InfoItem
              icon={<UserCogIcon className="h-4 w-4" />}
              label="Status"
              value={user.active ? 'Active' : 'Inactive'}
            />
            <InfoItem
              icon={<CameraIcon className="h-4 w-4" />}
              label="Auth providers"
              value={user.authProviders.length > 0 ? user.authProviders.join(', ') : 'None'}
            />
            <InfoItem
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Created"
              value={formatDateTime(user.createdAt)}
            />
            <InfoItem
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Updated"
              value={formatDateTime(user.updatedAt)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
          <CardDescription>All billing transactions and event pass purchases for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={paymentsTab} onValueChange={setPaymentsTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="transactions">
                Transactions
                {transactions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{transactions.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="event-passes">
                Event Passes
                {eventPasses.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{eventPasses.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              {transactionsQuery.isLoading ? (
                <div className="space-y-3 p-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-32 flex-1" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No billing transactions found for this user.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDateTime(tx.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="whitespace-nowrap">
                              {formatTransactionType(tx.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tx.provider === 'DODO'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-sky-100 text-sky-700'
                              }
                            >
                              {tx.provider}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {tx.productName ?? tx.eventName ?? tx.eventType ?? '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            {formatCurrency(tx.amount, tx.currency ?? 'USD')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="event-passes">
              {eventPassesQuery.isLoading ? (
                <div className="space-y-3 p-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-32 flex-1" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : eventPasses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No event pass purchases found for this user.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventPasses.map((pass) => (
                        <TableRow key={pass.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDateTime(pass.purchasedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                pass.provider === 'DODO'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-sky-100 text-sky-700'
                              }
                            >
                              {pass.provider}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={paymentStatusClass(pass.paymentStatus)}>
                              {pass.paymentStatus?.replaceAll('_', ' ') ?? 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {pass.event?.name ?? 'Unclaimed'}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            {formatCurrency(pass.amount, pass.currency ?? 'USD')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function formatCurrency(amount: number | null | undefined, currency = 'USD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

function formatTransactionType(type: string) {
  switch (type) {
    case 'event_pass_purchase':
      return 'Event pass'
    case 'event_pass_refund':
      return 'Pass refund'
    case 'event_pass_dispute':
      return 'Pass dispute'
    case 'initial_purchase':
      return 'New subscription'
    case 'product_change':
      return 'Plan change'
    default:
      return type.replaceAll('_', ' ')
  }
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

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
