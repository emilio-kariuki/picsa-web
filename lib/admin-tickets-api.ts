import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminTicketStatusValue = 'open' | 'in-progress' | 'resolved' | 'closed'
export type AdminTicketPriorityValue = 'low' | 'medium' | 'high' | 'urgent'
export type AdminTicketSortBy = 'createdAt' | 'updatedAt' | 'priority' | 'status'
export type AdminTicketSortOrder = 'ASC' | 'DESC'

export interface AdminTicketsQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: AdminTicketSortBy
  sortOrder?: AdminTicketSortOrder
  status?: AdminTicketStatusValue
  priority?: AdminTicketPriorityValue
  assigned?: boolean
  createdFrom?: string
  createdTo?: string
}

export interface AdminTicketAgent {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

export interface AdminTicketComment {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
    isStaff: boolean
  }
  content: string
  createdAt: string
}

export interface AdminTicketSummary {
  id: string
  ticketNumber: string
  subject: string
  description: string
  priority: AdminTicketPriorityValue
  status: AdminTicketStatusValue
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  comments: AdminTicketComment[]
  createdAt: string
  updatedAt: string
  commentCount: number
  lastCommentAt: string | null
  awaitingStaffResponse: boolean
}

export type AdminTicketDetail = AdminTicketSummary

export interface AdminTicketOverview {
  totalCount: number
  openCount: number
  urgentCount: number
  unassignedCount: number
  awaitingStaffResponseCount: number
  resolvedCount: number
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

export type AdminTicketsResponse = ApiSuccessResponse<AdminPaginatedData<AdminTicketSummary>>
export type AdminTicketResponse = ApiSuccessResponse<{ ticket: AdminTicketDetail }>
export type AdminTicketAgentsResponse = ApiSuccessResponse<{ agents: AdminTicketAgent[] }>
export type AdminTicketOverviewResponse = ApiSuccessResponse<{ overview: AdminTicketOverview }>

export interface UpdateAdminTicketStatusInput {
  status: AdminTicketStatusValue
}

export interface AssignAdminTicketInput {
  agentId: string | null
}

export interface AddAdminTicketCommentInput {
  content: string
}

function buildTicketsQueryString(query: AdminTicketsQueryInput) {
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

export async function listAdminTickets(
  accessToken: string,
  query: AdminTicketsQueryInput,
) {
  return adminApiRequest<AdminTicketsResponse>(
    `/admin/tickets${buildTicketsQueryString(query)}`,
    {
      accessToken,
    },
  )
}

export async function getAdminTicketById(accessToken: string, ticketId: string) {
  return adminApiRequest<AdminTicketResponse>(`/admin/tickets/${ticketId}`, {
    accessToken,
  })
}

export async function getAdminTicketOverview(accessToken: string) {
  return adminApiRequest<AdminTicketOverviewResponse>('/admin/tickets/overview', {
    accessToken,
  })
}

export async function listAdminTicketAgents(accessToken: string) {
  return adminApiRequest<AdminTicketAgentsResponse>('/admin/tickets/agents', {
    accessToken,
  })
}

export async function updateAdminTicketStatus(
  accessToken: string,
  ticketId: string,
  input: UpdateAdminTicketStatusInput,
) {
  return adminApiRequest<AdminTicketResponse>(`/admin/tickets/${ticketId}/status`, {
    method: 'PATCH',
    accessToken,
    body: {
      status: input.status,
    },
  })
}

export async function assignAdminTicket(
  accessToken: string,
  ticketId: string,
  input: AssignAdminTicketInput,
) {
  return adminApiRequest<AdminTicketResponse>(`/admin/tickets/${ticketId}/assignment`, {
    method: 'PATCH',
    accessToken,
    body: {
      agentId: input.agentId,
    },
  })
}

export async function addAdminTicketComment(
  accessToken: string,
  ticketId: string,
  input: AddAdminTicketCommentInput,
) {
  return adminApiRequest<AdminTicketResponse>(`/admin/tickets/${ticketId}/comments`, {
    method: 'POST',
    accessToken,
    body: {
      content: input.content,
    },
  })
}
