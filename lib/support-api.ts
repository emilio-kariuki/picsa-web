import {
  apiRequest,
  type ApiSuccessResponse,
} from '@/lib/api'

export interface AccountDeletionRequestInput {
  email: string
  reason: string
}

export interface AccountDeletionRequestResponseData {
  expectedResponseTimeHours: number
}

export function createAccountDeletionRequest(
  input: AccountDeletionRequestInput,
) {
  return apiRequest<ApiSuccessResponse<AccountDeletionRequestResponseData>>(
    '/support/account-deletion-requests',
    {
      method: 'POST',
      body: input,
    },
  )
}
