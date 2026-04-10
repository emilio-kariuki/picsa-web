import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminNotificationAudienceType = 'USER' | 'USERS' | 'EVENT' | 'ALL'
export type AdminNotificationBatchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type AdminNotificationBatchSortBy = 'createdAt' | 'processedAt' | 'status'
export type AdminNotificationBatchSortOrder = 'ASC' | 'DESC'

export interface AdminNotificationBatchesQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: AdminNotificationBatchSortBy
  sortOrder?: AdminNotificationBatchSortOrder
  audienceType?: AdminNotificationAudienceType
  status?: AdminNotificationBatchStatus
}

export interface AdminNotificationBatchActor {
  id: string
  email: string
  name: string
}

export interface AdminNotificationBatchSummary {
  id: string
  audienceType: AdminNotificationAudienceType
  title: string
  body: string
  data: Record<string, string>
  totalRecipients: number
  status: AdminNotificationBatchStatus
  processedAt: string | null
  processingError: string | null
  createdAt: string
  createdBy: AdminNotificationBatchActor
}

export type AdminNotificationBatchDetail = AdminNotificationBatchSummary

export interface AdminNotificationBatchOverview {
  totalCount: number
  pendingCount: number
  processingCount: number
  completedCount: number
  failedCount: number
  allAudienceCount: number
  singleUserAudienceCount: number
  selectedUsersAudienceCount: number
  eventAudienceCount: number
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

export interface CreateAdminSystemNotificationInput {
  audienceType: AdminNotificationAudienceType
  userId?: string
  userIds?: string[]
  eventId?: string
  title: string
  body: string
  data?: Record<string, string>
}

export type AdminNotificationBatchesResponse = ApiSuccessResponse<
  AdminPaginatedData<AdminNotificationBatchSummary>
>
export type AdminNotificationBatchResponse = ApiSuccessResponse<{
  batch: AdminNotificationBatchDetail
}>
export type AdminNotificationOverviewResponse = ApiSuccessResponse<{
  overview: AdminNotificationBatchOverview
}>

function buildNotificationQueryString(query: AdminNotificationBatchesQueryInput) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') {
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export async function listAdminNotificationBatches(
  accessToken: string,
  query: AdminNotificationBatchesQueryInput,
) {
  return adminApiRequest<AdminNotificationBatchesResponse>(
    `/admin/notifications/batches${buildNotificationQueryString(query)}`,
    {
      accessToken,
    },
  )
}

export async function getAdminNotificationBatchById(accessToken: string, batchId: string) {
  return adminApiRequest<AdminNotificationBatchResponse>(`/admin/notifications/batches/${batchId}`, {
    accessToken,
  })
}

export async function getAdminNotificationOverview(accessToken: string) {
  return adminApiRequest<AdminNotificationOverviewResponse>('/admin/notifications/overview', {
    accessToken,
  })
}

export async function createAdminSystemNotification(
  accessToken: string,
  input: CreateAdminSystemNotificationInput,
) {
  return adminApiRequest<AdminNotificationBatchResponse>('/admin/notifications/system', {
    method: 'POST',
    accessToken,
    body: input as unknown as Record<string, unknown>,
  })
}
