import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminPaymentSubscriptionStatus =
  | 'active'
  | 'trial'
  | 'grace_period'
  | 'cancelled'
  | 'expired'
  | 'paused'

export type AdminPaymentBillingCadence =
  | 'monthly'
  | 'annual'
  | 'weekly'
  | 'lifetime'
  | 'unknown'

export type AdminBillingProvider = 'REVENUECAT' | 'DODO'

export type AdminSubscriptionTransactionType =
  | 'initial_purchase'
  | 'renewal'
  | 'product_change'
  | 'cancellation'
  | 'refund'
  | 'other'

export type AdminBillingTransactionType =
  | AdminSubscriptionTransactionType
  | 'event_pass_purchase'
  | 'event_pass_refund'
  | 'event_pass_dispute'

export type AdminPaymentsSortOrder = 'ASC' | 'DESC'

export interface AdminPaymentsSubscriptionsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'email' | 'expiresAt' | 'store'
  sortOrder?: AdminPaymentsSortOrder
  isActive?: boolean
  store?: string
  willRenew?: boolean
  expiresBefore?: string
  expiresAfter?: string
  isSandbox?: boolean
}

export interface AdminEventPassPaymentsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'purchasedAt' | 'amount' | 'provider' | 'paymentStatus' | 'claimedAt' | 'revokedAt'
  sortOrder?: AdminPaymentsSortOrder
  provider?: AdminBillingProvider
  paymentStatus?: string
  claimed?: boolean
  revoked?: boolean
  isSandbox?: boolean
}

export interface AdminBillingTransactionsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'amount' | 'provider' | 'type'
  sortOrder?: AdminPaymentsSortOrder
  provider?: AdminBillingProvider
  type?: AdminBillingTransactionType
  createdFrom?: string
  createdTo?: string
  isSandbox?: boolean
}

export interface AdminPaymentSubscription {
  id: string
  subscriberId: string
  subscriberName: string
  subscriberEmail: string
  subscriberAvatar?: string
  productId: string | null
  productName: string
  store: string | null
  status: AdminPaymentSubscriptionStatus
  periodType: AdminPaymentBillingCadence
  price: number | null
  currency: string | null
  startedAt: string | null
  renewsAt: string | null
  expiresAt: string | null
  isTrial: boolean
  isAutoRenew: boolean
  lastTransactionId: string | null
  lastTransactionAt: string | null
}

export interface AdminEventPassPayment {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
  event: {
    id: string
    name: string
    url: string
  } | null
  provider: AdminBillingProvider
  paymentStatus: string | null
  amount: number | null
  currency: string | null
  productId: string
  store: string | null
  transactionId: string
  checkoutSessionId: string | null
  paymentId: string | null
  purchasedAt: string | null
  claimedAt: string | null
  revokedAt: string | null
  revocationReason: string | null
  refundStatus: string | null
  disputeStatus: string | null
  isClaimed: boolean
  isRevoked: boolean
}

export interface AdminBillingTransaction {
  id: string
  provider: AdminBillingProvider
  source: 'subscription' | 'event_pass'
  type: AdminBillingTransactionType
  createdAt: string
  amount: number | null
  currency: string | null
  store: string | null
  transactionId: string | null
  paymentId: string | null
  checkoutSessionId: string | null
  eventType: string | null
  eventId: string | null
  eventName: string | null
  productId: string | null
  productName: string | null
  paymentStatus: string | null
  revocationReason: string | null
  subscriber: {
    id: string | null
    appUserId: string | null
    name: string
    email: string
    avatar: string | null
  }
}

export interface AdminPaymentOverview {
  subscriptions: {
    mrr: number
    mrrChange: number
    activeSubscriptions: number
    activeSubscriptionsChange: number
    trials: number
    trialsChange: number
    churnRate: number
    churnRateChange: number
    mrrSeries: Array<{
      month: string
      mrr: number
    }>
  }
  eventPasses: {
    grossRevenue: number
    totalPurchases: number
    availablePasses: number
    claimedPasses: number
    revokedPasses: number
    providerSplit: Array<{
      provider: AdminBillingProvider
      revenue: number
      purchases: number
    }>
  }
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

interface RawAdminPaymentsSubscriptionUser {
  id: string
  email: string | null
  name: string | null
  url: string | null
}

interface RawAdminPaymentsSubscriptionSummary {
  activeProductId: string | null
}

interface RawAdminPaymentsSubscriptionBilling {
  subscriberId: string | null
  status: AdminPaymentSubscriptionStatus
  productId: string | null
  productName: string | null
  store: string | null
  billingCadence: AdminPaymentBillingCadence
  price: number | null
  currency: string | null
  startedAt: string | null
  renewsAt: string | null
  expiresAt: string | null
  isTrial: boolean
  isAutoRenew: boolean
  lastTransactionId: string | null
  lastTransactionAt: string | null
}

interface RawAdminPaymentsSubscriptionItem {
  user: RawAdminPaymentsSubscriptionUser
  subscription: RawAdminPaymentsSubscriptionSummary
  billing: RawAdminPaymentsSubscriptionBilling
}

type RawAdminPaymentsSubscriptionsResponse = ApiSuccessResponse<
  AdminPaginatedData<RawAdminPaymentsSubscriptionItem>
>
type AdminPaymentsSubscriptionsResponse = ApiSuccessResponse<
  AdminPaginatedData<AdminPaymentSubscription>
>
type AdminEventPassPaymentsResponse = ApiSuccessResponse<
  AdminPaginatedData<AdminEventPassPayment>
>
type AdminBillingTransactionsResponse = ApiSuccessResponse<
  AdminPaginatedData<AdminBillingTransaction>
>
type AdminPaymentsOverviewResponse = ApiSuccessResponse<{
  overview: AdminPaymentOverview
}>

function buildQueryString(
  query: Record<string, string | number | boolean | null | undefined>,
) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') {
      continue
    }

    searchParams.set(key, typeof value === 'boolean' ? String(value) : String(value))
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

function formatProductName(productId: string | null | undefined) {
  if (!productId) {
    return 'Unknown product'
  }

  return productId
    .replace(/^picsa[_-]?/i, '')
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function mapSubscriptionItem(item: RawAdminPaymentsSubscriptionItem): AdminPaymentSubscription {
  const productId = item.billing.productId ?? item.subscription.activeProductId

  return {
    id: `${item.user.id}:${productId ?? 'subscription'}`,
    subscriberId: item.billing.subscriberId ?? item.user.id,
    subscriberName: item.user.name?.trim() || item.user.email || 'Unknown subscriber',
    subscriberEmail: item.user.email || '',
    subscriberAvatar: item.user.url || undefined,
    productId,
    productName: item.billing.productName || formatProductName(productId),
    store: item.billing.store,
    status: item.billing.status,
    periodType: item.billing.billingCadence,
    price: item.billing.price,
    currency: item.billing.currency,
    startedAt: item.billing.startedAt,
    renewsAt: item.billing.renewsAt,
    expiresAt: item.billing.expiresAt,
    isTrial: item.billing.isTrial,
    isAutoRenew: item.billing.isAutoRenew,
    lastTransactionId: item.billing.lastTransactionId,
    lastTransactionAt: item.billing.lastTransactionAt,
  }
}

export async function getAdminPaymentsOverview(accessToken: string, isSandbox?: boolean) {
  const qs = typeof isSandbox === 'boolean' ? `?isSandbox=${isSandbox}` : ''
  return adminApiRequest<AdminPaymentsOverviewResponse>(`/admin/payments/overview${qs}`, {
    accessToken,
  })
}

export async function listAdminPaymentSubscriptions(
  accessToken: string,
  query: AdminPaymentsSubscriptionsQueryInput,
) {
  const response = await adminApiRequest<RawAdminPaymentsSubscriptionsResponse>(
    `/admin/payments/subscriptions${buildQueryString(query as Record<string, string | number | boolean | null | undefined>)}`,
    {
      accessToken,
    },
  )

  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map(mapSubscriptionItem),
    },
  } satisfies AdminPaymentsSubscriptionsResponse
}

export async function listAdminEventPassPayments(
  accessToken: string,
  query: AdminEventPassPaymentsQueryInput,
) {
  return adminApiRequest<AdminEventPassPaymentsResponse>(
    `/admin/payments/event-pass-purchases${buildQueryString(query as Record<string, string | number | boolean | null | undefined>)}`,
    {
      accessToken,
    },
  )
}

export async function listAdminBillingTransactions(
  accessToken: string,
  query: AdminBillingTransactionsQueryInput,
) {
  return adminApiRequest<AdminBillingTransactionsResponse>(
    `/admin/payments/transactions${buildQueryString(query as Record<string, string | number | boolean | null | undefined>)}`,
    {
      accessToken,
    },
  )
}
