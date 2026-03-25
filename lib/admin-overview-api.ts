import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

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
}

export type AdminOverviewResponse = ApiSuccessResponse<{
  overview: AdminOverview
}>

export async function getAdminOverview(accessToken: string) {
  return adminApiRequest<AdminOverviewResponse>('/admin/overview', {
    accessToken,
  })
}
