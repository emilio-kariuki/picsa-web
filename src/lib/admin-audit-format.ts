import type {
  AdminAuditChannel,
  AdminAuditLogActor,
  AdminAuditLogSummary,
  AdminAuditOutcome,
} from '@/lib/admin-audit-logs-api'

export function formatAuditDateTime(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatAuditDuration(durationMs: number | null) {
  if (durationMs == null) {
    return '—'
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`
  }

  return `${(durationMs / 1000).toFixed(durationMs >= 10000 ? 0 : 2)} s`
}

export function formatAuditAction(action: string) {
  return action
    .replace(/[:._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getAuditActorDisplayName(actor: AdminAuditLogActor | null) {
  if (!actor) {
    return 'System'
  }

  const name = actor.name?.trim()

  if (name) {
    return name
  }

  return actor.email?.split('@')[0] ?? 'Unknown actor'
}

export function getAuditActorInitials(actor: AdminAuditLogActor | null) {
  const parts = getAuditActorDisplayName(actor).split(/\s+/).filter(Boolean)

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'S'
  )
}

export function getAuditChannelTone(channel: AdminAuditChannel) {
  switch (channel) {
    case 'HTTP':
      return 'bg-sky-100 text-sky-900'
    case 'SOCKET':
      return 'bg-violet-100 text-violet-900'
    case 'QUEUE':
      return 'bg-amber-100 text-amber-900'
    case 'SYSTEM':
      return 'bg-slate-200 text-slate-800'
    default:
      return 'bg-slate-200 text-slate-800'
  }
}

export function getAuditOutcomeTone(outcome: AdminAuditOutcome) {
  switch (outcome) {
    case 'SUCCESS':
      return 'bg-emerald-100 text-emerald-900'
    case 'FAILURE':
      return 'bg-rose-100 text-rose-900'
    default:
      return 'bg-slate-200 text-slate-800'
  }
}

export function getAuditSurfaceLabel(log: Pick<
  AdminAuditLogSummary,
  'channel' | 'method' | 'route' | 'socketEvent' | 'queueName' | 'consumerName'
>) {
  if (log.channel === 'HTTP') {
    if (log.method && log.route) {
      return `${log.method} ${log.route}`
    }

    return log.route ?? 'HTTP request'
  }

  if (log.channel === 'SOCKET') {
    return log.socketEvent ?? 'Socket event'
  }

  if (log.channel === 'QUEUE') {
    if (log.queueName && log.consumerName) {
      return `${log.queueName} · ${log.consumerName}`
    }

    return log.queueName ?? log.consumerName ?? 'Queue job'
  }

  return 'System activity'
}

export function getAuditResourceLabel(log: Pick<
  AdminAuditLogSummary,
  'resourceType' | 'resourceId' | 'statusCode' | 'errorCode' | 'errorMessage'
>) {
  if (log.resourceType) {
    return log.resourceType
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase())
  }

  if (log.errorCode) {
    return log.errorCode
  }

  if (log.statusCode != null) {
    return `HTTP ${log.statusCode}`
  }

  if (log.errorMessage) {
    return 'Failure'
  }

  return 'General'
}

export function stringifyAuditJson(value: Record<string, unknown> | null) {
  if (!value) {
    return 'No data recorded.'
  }

  return JSON.stringify(value, null, 2)
}
