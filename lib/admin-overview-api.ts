import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export interface AdminOverviewTickets {
  totalCount: number
  openCount: number
  inProgressCount: number
  resolvedCount: number
  urgentCount: number
  unassignedCount: number
  awaitingStaffResponseCount: number
}

export interface AdminOverviewGrowthPoint {
  date: string
  count: number
}

export interface AdminOverview {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  proUsers: number
  totalEvents: number
  activeEvents: number
  archivedEvents: number
  totalImages: number
  pendingModeratedImages: number
  rejectedImages: number
  totalNotificationBatches: number
  newUsersLast7d: number
  newUsersLast30d: number
  newEventsLast7d: number
  newEventsLast30d: number
  newImagesLast7d: number
  newImagesLast30d: number
  tickets: AdminOverviewTickets
  userGrowthSeries: AdminOverviewGrowthPoint[]
  eventGrowthSeries: AdminOverviewGrowthPoint[]
}

export type AdminOverviewResponse = ApiSuccessResponse<{
  overview: AdminOverview
}>

export async function getAdminOverview(accessToken: string) {
  return adminApiRequest<AdminOverviewResponse>('/admin/overview', {
    accessToken,
  })
}
