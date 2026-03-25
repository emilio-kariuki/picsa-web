import type { AdminUserSummary } from '@/lib/admin-users-api'
import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminImageStatusValue = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED'
export type AdminImageModerationStatusValue = 'APPROVED' | 'PENDING' | 'REJECTED'
export type AdminImageSortOrder = 'ASC' | 'DESC'

export interface AdminImagesQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'sizeBytes' | 'status'
  sortOrder?: AdminImageSortOrder
  eventId?: string
  userId?: string
  status?: AdminImageStatusValue
  moderationStatus?: AdminImageModerationStatusValue
  isPrivate?: boolean
  createdFrom?: string
  createdTo?: string
}

export interface AdminImageSummary {
  id: string
  eventId: string
  eventName: string | null
  uploader: AdminUserSummary
  status: AdminImageStatusValue
  moderationStatus: AdminImageModerationStatusValue
  isPrivate: boolean
  hd: boolean
  contentType: string
  sizeBytes: number
  createdAt: string
}

export interface AdminImageDetail extends AdminImageSummary {
  width: number | null
  height: number | null
  accessUrl: string | null
  accessUrlExpiresAt: string | null
  moderatedAt: string | null
  moderatedByUserId: string | null
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

export type AdminImagesResponse = ApiSuccessResponse<AdminPaginatedData<AdminImageSummary>>
export type AdminImageResponse = ApiSuccessResponse<{ image: AdminImageDetail }>

export interface UpdateAdminImageModerationInput {
  moderationStatus: AdminImageModerationStatusValue
  reason: string
}

function buildImagesQueryString(query: AdminImagesQueryInput) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') {
      continue
    }

    searchParams.set(key, typeof value === 'boolean' ? String(value) : value)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export async function listAdminImages(
  accessToken: string,
  query: AdminImagesQueryInput,
) {
  return adminApiRequest<AdminImagesResponse>(
    `/admin/images${buildImagesQueryString(query)}`,
    {
      accessToken,
    },
  )
}

export async function getAdminImageById(accessToken: string, imageId: string) {
  return adminApiRequest<AdminImageResponse>(`/admin/images/${imageId}`, {
    accessToken,
  })
}

export async function updateAdminImageModeration(
  accessToken: string,
  imageId: string,
  input: UpdateAdminImageModerationInput,
) {
  return adminApiRequest<AdminImageResponse>(`/admin/images/${imageId}/moderation`, {
    method: 'PATCH',
    accessToken,
    body: {
      moderationStatus: input.moderationStatus,
      reason: input.reason,
    },
  })
}

export async function deleteAdminImage(accessToken: string, imageId: string) {
  return adminApiRequest<ApiSuccessResponse<Record<string, never>>>(`/admin/images/${imageId}`, {
    method: 'DELETE',
    accessToken,
  })
}
