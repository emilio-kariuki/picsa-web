import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminAuditChannel = 'HTTP' | 'SOCKET' | 'QUEUE' | 'SYSTEM'
export type AdminAuditOutcome = 'SUCCESS' | 'FAILURE'
export type AdminAuditSortOrder = 'ASC' | 'DESC'

export interface AdminAuditLogsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?:
    | 'action'
    | 'channel'
    | 'createdAt'
    | 'durationMs'
    | 'outcome'
    | 'route'
    | 'statusCode'
  sortOrder?: AdminAuditSortOrder
  channel?: AdminAuditChannel
  outcome?: AdminAuditOutcome
  actorUserId?: string
  resourceType?: string
  resourceId?: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  route?: string
  socketEvent?: string
  queueName?: string
  consumerName?: string
  requestId?: string
  createdFrom?: string
  createdTo?: string
}

export interface AdminAuditLogActor {
  id: string
  email: string | null
  name: string | null
  role: string | null
}

export interface AdminAuditLogSummary {
  id: string
  channel: AdminAuditChannel
  action: string
  outcome: AdminAuditOutcome
  actorUserId: string | null
  actorRole: string | null
  requestId: string | null
  parentAuditLogId: string | null
  method: string | null
  route: string | null
  statusCode: number | null
  socketEvent: string | null
  queueName: string | null
  consumerName: string | null
  resourceType: string | null
  resourceId: string | null
  ipAddress: string | null
  userAgent: string | null
  durationMs: number | null
  errorCode: string | null
  errorMessage: string | null
  createdAt: string
  actor: AdminAuditLogActor | null
}

export interface AdminAuditLogDetail extends AdminAuditLogSummary {
  requestJson: Record<string, unknown> | null
  responseJson: Record<string, unknown> | null
  metadataJson: Record<string, unknown> | null
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

export type AdminAuditLogsResponse =
  ApiSuccessResponse<AdminPaginatedData<AdminAuditLogSummary>>
export type AdminAuditLogResponse = ApiSuccessResponse<{
  auditLog: AdminAuditLogDetail
}>

function buildAuditLogsQueryString(query: AdminAuditLogsQueryInput) {
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

export async function listAdminAuditLogs(
  accessToken: string,
  query: AdminAuditLogsQueryInput,
) {
  return adminApiRequest<AdminAuditLogsResponse>(
    `/admin/audit-logs${buildAuditLogsQueryString(query)}`,
    {
      accessToken,
    },
  )
}

export async function getAdminAuditLogById(
  accessToken: string,
  auditLogId: string,
) {
  return adminApiRequest<AdminAuditLogResponse>(
    `/admin/audit-logs/${auditLogId}`,
    {
      accessToken,
    },
  )
}
