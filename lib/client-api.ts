import { apiRequest, type ApiSuccessResponse } from '@/lib/api'
import type {
  ClientAppConfig,
  ClientCheckoutFlow,
  ClientCheckoutSessionCreateResult,
  ClientCheckoutSessionStatusResult,
  ClientEvent,
  ClientEventInput,
  ClientEventPassPurchase,
  ClientEventInvitation,
  ClientEventJoinRequest,
  ClientEventParticipant,
  ClientImage,
  ClientImageBatchResult,
  ClientImageShareLink,
  ClientNotification,
  ClientNotificationPage,
  ClientUserConfig,
} from '@/lib/client-types'

export interface CursorListQuery {
  cursor?: string | null
  limit?: number
}

export interface NotificationsQuery extends CursorListQuery {
  unreadOnly?: boolean
}

function buildQueryString(query: object) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(
    query as Record<string, string | number | boolean | null | undefined>,
  )) {
    if (value == null || value === '') {
      continue
    }

    params.set(key, String(value))
  }

  const text = params.toString()
  return text ? `?${text}` : ''
}

export async function fetchHostedEvents(accessToken: string) {
  const response = await apiRequest<ApiSuccessResponse<{ events: ClientEvent[] }>>('/events/me/hosted', {
    accessToken,
  })

  return response.data.events
}

export async function fetchEvent(accessToken: string, eventId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ event: ClientEvent }>>(`/events/${eventId}`, {
    accessToken,
  })

  return response.data.event
}

export async function fetchEventPasses(accessToken: string) {
  const response = await apiRequest<ApiSuccessResponse<{
    availableCount: number
    totalCount: number
    purchases: ClientEventPassPurchase[]
  }>>('/subscriptions/event-passes', {
    accessToken,
  })

  return response.data
}

export async function claimEventPassForEvent(accessToken: string, eventId: string) {
  const response = await apiRequest<ApiSuccessResponse<{
    eventId: string
    billing: ClientEvent['billing']
    availablePassCount: number
  }>>(`/events/${eventId}/billing/claim`, {
    method: 'POST',
    accessToken,
  })

  return response.data
}

export async function createEventPassCheckoutSession(
  accessToken: string,
  input: {
    flow: ClientCheckoutFlow
    eventId?: string | null
    draftEvent?: ClientEventInput | null
    returnPath?: string | null
  },
) {
  const response = await apiRequest<ApiSuccessResponse<ClientCheckoutSessionCreateResult>>(
    '/payments/event-passes/checkout-sessions',
    {
      method: 'POST',
      accessToken,
      body: input,
    },
  )

  return response.data
}

export async function fetchEventPassCheckoutStatus(accessToken: string, identifier: string) {
  const response = await apiRequest<ApiSuccessResponse<ClientCheckoutSessionStatusResult>>(
    `/payments/event-passes/checkout-sessions/${identifier}`,
    {
      accessToken,
    },
  )

  return response.data
}

export async function createEvent(accessToken: string, input: ClientEventInput) {
  const response = await apiRequest<ApiSuccessResponse<{ event: ClientEvent }>>('/events', {
    method: 'POST',
    accessToken,
    body: input,
  })

  return response.data.event
}

export async function updateEvent(accessToken: string, eventId: string, input: ClientEventInput) {
  const response = await apiRequest<ApiSuccessResponse<{ event: ClientEvent }>>(`/events/${eventId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
  })

  return response.data.event
}

export async function deleteEvent(accessToken: string, eventId: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>(`/events/${eventId}`, {
    method: 'DELETE',
    accessToken,
  })
}

export async function uploadEventDisplayPicture(accessToken: string, eventId: string, file: File) {
  const formData = new FormData()
  formData.append('displayPicture', file)

  const response = await apiRequest<ApiSuccessResponse<{ event: ClientEvent }>>(
    `/events/${eventId}/display-picture`,
    {
      method: 'POST',
      accessToken,
      body: formData,
    },
  )

  return response.data.event
}

export async function fetchEventParticipants(accessToken: string, eventId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ participants: ClientEventParticipant[] }>>(
    `/events/${eventId}/participants`,
    {
      accessToken,
    },
  )

  return response.data.participants
}

export async function fetchEventJoinRequests(accessToken: string, eventId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ requests: ClientEventJoinRequest[] }>>(
    `/events/${eventId}/join-requests`,
    {
      accessToken,
    },
  )

  return response.data.requests
}

export async function approveEventJoinRequest(accessToken: string, eventId: string, userId: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>(`/events/${eventId}/join-requests/${userId}/approve`, {
    method: 'POST',
    accessToken,
  })
}

export async function rejectEventJoinRequest(accessToken: string, eventId: string, userId: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>(`/events/${eventId}/join-requests/${userId}/reject`, {
    method: 'POST',
    accessToken,
  })
}

export async function createEventInvitation(accessToken: string, eventId: string, email: string) {
  const response = await apiRequest<ApiSuccessResponse<{ invitation: ClientEventInvitation }>>(
    `/events/${eventId}/invitations`,
    {
      method: 'POST',
      accessToken,
      body: { email },
    },
  )

  return response.data.invitation
}

export async function revokeEventInvitation(accessToken: string, eventId: string, invitationId: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>(`/events/${eventId}/invitations/${invitationId}`, {
    method: 'DELETE',
    accessToken,
  })
}

export async function fetchEventImages(accessToken: string, eventId: string, query: CursorListQuery = {}) {
  const response = await apiRequest<ApiSuccessResponse<{ images: ClientImage[]; nextCursor: string | null }>>(
    `/events/${eventId}/images${buildQueryString(query)}`,
    {
      accessToken,
    },
  )

  return response.data
}

export async function uploadEventImages(
  accessToken: string,
  eventId: string,
  files: File[],
  options?: { hd?: boolean; isPrivate?: boolean },
) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('images', file)
  })

  if (options?.hd != null) {
    formData.append('hd', String(options.hd))
  }

  if (options?.isPrivate != null) {
    formData.append('isPrivate', String(options.isPrivate))
  }

  const response = await apiRequest<ApiSuccessResponse<ClientImageBatchResult>>(`/events/${eventId}/images`, {
    method: 'POST',
    accessToken,
    body: formData,
  })

  return response.data
}

export async function fetchMyImages(accessToken: string, query: CursorListQuery = {}) {
  const response = await apiRequest<ApiSuccessResponse<{ images: ClientImage[]; nextCursor: string | null }>>(
    `/images/me${buildQueryString(query)}`,
    {
      accessToken,
    },
  )

  return response.data
}

export async function createImageShareLink(accessToken: string, imageId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ share: ClientImageShareLink }>>(
    `/images/${imageId}/share-link`,
    {
      method: 'POST',
      accessToken,
    },
  )

  return response.data.share
}

export async function approveImage(accessToken: string, imageId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ image: ClientImage }>>(`/images/${imageId}/approve`, {
    method: 'POST',
    accessToken,
  })

  return response.data.image
}

export async function rejectImage(accessToken: string, imageId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ image: ClientImage }>>(`/images/${imageId}/reject`, {
    method: 'POST',
    accessToken,
  })

  return response.data.image
}

export async function deleteImage(accessToken: string, imageId: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>(`/images/${imageId}`, {
    method: 'DELETE',
    accessToken,
  })
}

export async function fetchNotifications(accessToken: string, query: NotificationsQuery = {}): Promise<ClientNotificationPage> {
  const response = await apiRequest<ApiSuccessResponse<ClientNotificationPage>>(
    `/notifications${buildQueryString(query)}`,
    {
      accessToken,
    },
  )

  return response.data
}

export async function fetchNotificationsUnreadCount(accessToken: string) {
  const response = await apiRequest<ApiSuccessResponse<{ unreadCount: number }>>('/notifications/unread-count', {
    accessToken,
  })

  return response.data.unreadCount
}

export async function markNotificationRead(accessToken: string, notificationId: string) {
  const response = await apiRequest<ApiSuccessResponse<{ notification: ClientNotification }>>(
    `/notifications/${notificationId}/read`,
    {
      method: 'POST',
      accessToken,
    },
  )

  return response.data.notification
}

export async function markAllNotificationsRead(accessToken: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>('/notifications/read-all', {
    method: 'POST',
    accessToken,
  })
}

export async function fetchUserConfig(accessToken: string) {
  const response = await apiRequest<ApiSuccessResponse<{ userConfig: ClientUserConfig }>>('/user-config/me', {
    accessToken,
  })

  return response.data.userConfig
}

export async function updateUserConfig(
  accessToken: string,
  input: Partial<Pick<ClientUserConfig, 'pushNotificationsEnabled' | 'emailNotificationsEnabled' | 'vibrationsEnabled'>>,
) {
  const response = await apiRequest<ApiSuccessResponse<{ userConfig: ClientUserConfig }>>('/user-config/me', {
    method: 'PATCH',
    accessToken,
    body: input,
  })

  return response.data.userConfig
}

export async function fetchAppConfig() {
  const response = await apiRequest<ApiSuccessResponse<ClientAppConfig>>('/app-config')
  return response.data
}

export async function deleteClientAccount(
  accessToken: string,
  reason?: string,
) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>('/auth/delete', {
    method: 'POST',
    accessToken,
    body: {
      reason,
    },
  })
}
