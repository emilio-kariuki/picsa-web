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
  userGrowthWeeklySeries: AdminOverviewGrowthPoint[]
  eventGrowthWeeklySeries: AdminOverviewGrowthPoint[]
  userGrowthMonthlySeries: AdminOverviewGrowthPoint[]
  eventGrowthMonthlySeries: AdminOverviewGrowthPoint[]
}

export type AdminOverviewResponse = ApiSuccessResponse<{
  overview: AdminOverview
}>

export async function getAdminOverview(accessToken: string) {
  return adminApiRequest<AdminOverviewResponse>('/admin/overview', {
    accessToken,
  })
}

export interface AdminAnalytics {
  dau: number
  wau: number
  mau: number
  dauMauRatio: number
  dauSeries: AdminOverviewGrowthPoint[]
  wauSeries: AdminOverviewGrowthPoint[]
  mauSeries: AdminOverviewGrowthPoint[]
  topRoutes: Array<{ route: string; count: number }>
}

export type AdminAnalyticsResponse = ApiSuccessResponse<{
  analytics: AdminAnalytics
}>

export async function getAdminAnalytics(accessToken: string) {
  return adminApiRequest<AdminAnalyticsResponse>('/admin/overview/analytics', {
    accessToken,
  })
}
