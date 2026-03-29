import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'
import type {
  ClientAppConfig,
  ClientAppConfigLinks,
  ClientAppConfigPayments,
  ClientAppConfigPlan,
  ClientAppConfigUpdates,
  ClientAppConfigUploads,
} from '@/lib/client-types'

export interface EditableAdminAppConfig {
  plan: ClientAppConfigPlan
  uploads: ClientAppConfigUploads
  links: ClientAppConfigLinks
  payments: ClientAppConfigPayments
  updates: ClientAppConfigUpdates
}

export interface AdminAppConfigData {
  config: ClientAppConfig
  updatedAt: string | null
  updatedByUserId: string | null
}

export type AdminAppConfigResponse = ApiSuccessResponse<AdminAppConfigData>

export async function fetchAdminAppConfig(accessToken: string) {
  return adminApiRequest<AdminAppConfigResponse>('/admin/app-config', {
    accessToken,
  })
}

export async function updateAdminAppConfig(
  accessToken: string,
  input: EditableAdminAppConfig,
) {
  return adminApiRequest<AdminAppConfigResponse>('/admin/app-config', {
    method: 'PUT',
    accessToken,
    body: input,
  })
}
