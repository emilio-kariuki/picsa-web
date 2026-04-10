import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminEventStatusValue = 'ACTIVE' | 'ARCHIVED'
export type AdminEventJoinModeValue = 'OPEN' | 'APPROVAL_REQUIRED' | 'INVITE_ONLY'
export type AdminEventSortOrder = 'ASC' | 'DESC'

export interface AdminEventsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'memberCount'
  sortOrder?: AdminEventSortOrder
  status?: AdminEventStatusValue
  joinMode?: AdminEventJoinModeValue
  hostUserId?: string
  isPrivate?: boolean
  createdFrom?: string
  createdTo?: string
}

export interface AdminEventHost {
  id: string
  name: string | null
  email: string | null
  url: string | null
}

export interface AdminEventSummary {
  id: string
  name: string
  description: string | null
  url: string
  host: AdminEventHost
  isPrivate: boolean
  joinMode: AdminEventJoinModeValue
  memberCount: number
  maxGuests: number
  maxImages: number
  status: AdminEventStatusValue
  createdAt: string
  updatedAt: string
}

export interface AdminEventBilling {
  tier: 'FREE' | 'PRO'
  isPaid: boolean
  unlockedAt: string | null
  productId: string | null
  store: string | null
}

export interface AdminEventDetail extends AdminEventSummary {
  startAt: string | null
  endAt: string | null
  settings: {
    isPrivate: boolean
    joinMode: AdminEventJoinModeValue
    allowGuestsToInvite: boolean
    allowGuestsChat: boolean
    allowGalleryUpload: boolean
    allowImagesToBeShared: boolean
    moderateContent: boolean
  }
  counts: {
    activeMembersCount: number
    pendingMembersCount: number
    invitationCount: number
    activeInvitationCount: number
    imageCount: number
    pendingImageModerationCount: number
  }
  chat: {
    roomExists: boolean
    messageCount: number
    lastMessageAt: string | null
  }
  billing: AdminEventBilling
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

export type AdminEventsResponse = ApiSuccessResponse<AdminPaginatedData<AdminEventSummary>>
export type AdminEventResponse = ApiSuccessResponse<{ event: AdminEventDetail }>

export interface UpdateAdminEventStatusInput {
  status: AdminEventStatusValue
  reason: string
}

function buildEventsQueryString(query: AdminEventsQueryInput) {
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

export async function listAdminEvents(
  accessToken: string,
  query: AdminEventsQueryInput,
) {
  return adminApiRequest<AdminEventsResponse>(
    `/admin/events${buildEventsQueryString(query)}`,
    {
      accessToken,
    },
  )
}

export async function getAdminEventById(accessToken: string, eventId: string) {
  return adminApiRequest<AdminEventResponse>(`/admin/events/${eventId}`, {
    accessToken,
  })
}

export async function updateAdminEventStatus(
  accessToken: string,
  eventId: string,
  input: UpdateAdminEventStatusInput,
) {
  return adminApiRequest<AdminEventResponse>(`/admin/events/${eventId}/status`, {
    method: 'PATCH',
    accessToken,
    body: {
      status: input.status,
      reason: input.reason,
    },
  })
}
