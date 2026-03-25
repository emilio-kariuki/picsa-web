import { format, formatDistanceToNow } from 'date-fns'
import { MARKETING_APP_URL, buildClientEventUrl } from '@/lib/site-urls'
import type { ClientEventInvitation, ClientEventSettings, ClientImage, ClientNotificationType, EventJoinMode } from '@/lib/client-types'

export function formatDateTime(value: string | null | undefined, fallback = 'Not set') {
  if (!value) {
    return fallback
  }

  try {
    return format(new Date(value), 'MMM d, yyyy h:mm a')
  } catch {
    return fallback
  }
}

export function formatDateShort(value: string | null | undefined, fallback = 'No date') {
  if (!value) {
    return fallback
  }

  try {
    return format(new Date(value), 'MMM d, yyyy')
  } catch {
    return fallback
  }
}

export function formatRelativeTime(value: string | null | undefined, fallback = 'Just now') {
  if (!value) {
    return fallback
  }

  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true })
  } catch {
    return fallback
  }
}

export function formatEventWindow(startAt: string | null, endAt: string | null) {
  if (startAt && endAt) {
    return `${formatDateShort(startAt)} to ${formatDateShort(endAt)}`
  }

  if (startAt) {
    return `Starts ${formatDateShort(startAt)}`
  }

  if (endAt) {
    return `Ends ${formatDateShort(endAt)}`
  }

  return 'Date to be announced'
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`
}

export function getJoinModeLabel(joinMode: EventJoinMode) {
  switch (joinMode) {
    case 'APPROVAL_REQUIRED':
      return 'Approval required'
    case 'INVITE_ONLY':
      return 'Invite only'
    case 'OPEN':
    default:
      return 'Open join'
  }
}

export function getNotificationTypeLabel(type: ClientNotificationType) {
  switch (type) {
    case 'chat_message':
      return 'Chat message'
    case 'event_invitation':
      return 'Invitation'
    case 'event_join_approved':
      return 'Join approved'
    case 'event_join_rejected':
      return 'Join rejected'
    case 'event_join_request':
      return 'Join request'
    case 'system':
    default:
      return 'System'
  }
}

export function getImageStatusLabel(image: Pick<ClientImage, 'status' | 'moderationStatus'>) {
  if (image.status === 'FAILED') {
    return 'Failed'
  }

  if (image.status === 'UPLOADING') {
    return 'Uploading'
  }

  if (image.status === 'PROCESSING') {
    return 'Processing'
  }

  if (image.moderationStatus === 'PENDING') {
    return 'Pending review'
  }

  if (image.moderationStatus === 'REJECTED') {
    return 'Rejected'
  }

  return 'Ready'
}

export function summarizeSettings(settings: ClientEventSettings) {
  return [
    settings.isPrivate ? 'Private event' : 'Public event',
    getJoinModeLabel(settings.joinMode),
    settings.allowGalleryUpload ? 'Guests can upload' : 'Uploads host-led',
    settings.moderateContent ? 'Moderated gallery' : 'Instant publishing',
  ]
}

export function buildClientManageLink(eventId: string) {
  return buildClientEventUrl(eventId)
}

export function buildClientGuestLink(slugOrId: string) {
  return `${MARKETING_APP_URL}/join/${slugOrId}`
}

function getInvitationsStorageKey(eventId: string) {
  return `client-event-invitations:${eventId}`
}

export function readStoredInvitations(eventId: string) {
  if (typeof window === 'undefined') {
    return [] as ClientEventInvitation[]
  }

  const rawValue = window.localStorage.getItem(getInvitationsStorageKey(eventId))

  if (!rawValue) {
    return [] as ClientEventInvitation[]
  }

  try {
    const parsed = JSON.parse(rawValue) as ClientEventInvitation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    window.localStorage.removeItem(getInvitationsStorageKey(eventId))
    return [] as ClientEventInvitation[]
  }
}

export function writeStoredInvitations(eventId: string, invitations: ClientEventInvitation[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getInvitationsStorageKey(eventId), JSON.stringify(invitations))
}
