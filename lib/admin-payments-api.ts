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

export type AdminPaymentTransactionType =
  | 'initial_purchase'
  | 'renewal'
  | 'product_change'
  | 'cancellation'
  | 'refund'
  | 'other'

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
}

export interface AdminPaymentsTransactionsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'amount' | 'type' | 'store'
  sortOrder?: AdminPaymentsSortOrder
  type?: AdminPaymentTransactionType
  store?: string
  createdFrom?: string
  createdTo?: string
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

export interface AdminPaymentTransaction {
  id: string
  transactionId: string
  subscriberId: string | null
  appUserId: string | null
  subscriberName: string
  subscriberEmail: string
  subscriberAvatar?: string
  productId: string | null
  productName: string
  store: string | null
  type: AdminPaymentTransactionType
  eventType: string
  amount: number | null
  currency: string | null
  revenueNet: number | null
  createdAt: string
}

export interface AdminPaymentOverview {
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

interface RawAdminPaymentTransactionSubscriber {
  id: string | null
  appUserId: string | null
  name: string
  email: string
  avatar?: string
}

interface RawAdminPaymentTransactionItem {
  id: string
  transactionId: string
  subscriber: RawAdminPaymentTransactionSubscriber
  productId: string | null
  productName: string | null
  store: string | null
  type: AdminPaymentTransactionType
  eventType: string
  amount: number | null
  currency: string | null
  revenueNet: number | null
  createdAt: string
}

type RawAdminPaymentsSubscriptionsResponse = ApiSuccessResponse<
  AdminPaginatedData<RawAdminPaymentsSubscriptionItem>
>
type RawAdminPaymentsTransactionsResponse = ApiSuccessResponse<
  AdminPaginatedData<RawAdminPaymentTransactionItem>
>
export type AdminPaymentsSubscriptionsResponse = ApiSuccessResponse<
  AdminPaginatedData<AdminPaymentSubscription>
>
export type AdminPaymentsTransactionsResponse = ApiSuccessResponse<
  AdminPaginatedData<AdminPaymentTransaction>
>
export type AdminPaymentsOverviewResponse = ApiSuccessResponse<{
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

function mapTransactionItem(item: RawAdminPaymentTransactionItem): AdminPaymentTransaction {
  return {
    id: item.id,
    transactionId: item.transactionId,
    subscriberId: item.subscriber.id,
    appUserId: item.subscriber.appUserId,
    subscriberName: item.subscriber.name,
    subscriberEmail: item.subscriber.email,
    subscriberAvatar: item.subscriber.avatar,
    productId: item.productId,
    productName: item.productName || formatProductName(item.productId),
    store: item.store,
    type: item.type,
    eventType: item.eventType,
    amount: item.amount,
    currency: item.currency,
    revenueNet: item.revenueNet,
    createdAt: item.createdAt,
  }
}

export async function listAdminPaymentSubscriptions(
  accessToken: string,
  query: AdminPaymentsSubscriptionsQueryInput,
) {
  const response = await adminApiRequest<RawAdminPaymentsSubscriptionsResponse>(
    `/admin/subscriptions${buildQueryString(query as Record<string, string | number | boolean | null | undefined>)}`,
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

export async function getAdminPaymentsOverview(accessToken: string) {
  return adminApiRequest<AdminPaymentsOverviewResponse>('/admin/subscriptions/overview', {
    accessToken,
  })
}

export async function listAdminPaymentTransactions(
  accessToken: string,
  query: AdminPaymentsTransactionsQueryInput,
) {
  const response = await adminApiRequest<RawAdminPaymentsTransactionsResponse>(
    `/admin/subscriptions/transactions${buildQueryString(query as Record<string, string | number | boolean | null | undefined>)}`,
    {
      accessToken,
    },
  )

  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map(mapTransactionItem),
    },
  } satisfies AdminPaymentsTransactionsResponse
}
