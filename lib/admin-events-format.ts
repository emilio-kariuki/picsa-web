import type { AdminEventJoinModeValue, AdminEventSummary } from '@/lib/admin-events-api'

export function formatEventDate(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatEventDateTime(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatEventJoinMode(value: AdminEventJoinModeValue) {
  if (value === 'APPROVAL_REQUIRED') {
    return 'Approval required'
  }

  if (value === 'INVITE_ONLY') {
    return 'Invite only'
  }

  return 'Open'
}

export function getEventHostDisplayName(event: Pick<AdminEventSummary, 'host'>) {
  const name = event.host.name?.trim()

  if (name) {
    return name
  }

  return event.host.email?.split('@')[0] ?? 'Unknown host'
}

export function getEventHostInitials(event: Pick<AdminEventSummary, 'host'>) {
  const parts = getEventHostDisplayName(event).split(/\s+/).filter(Boolean)

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'H'
  )
}
