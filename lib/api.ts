export interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  code?: string
  errors?: string[]
}

export class AdminApiError extends Error {
  status: number
  code?: string
  errors?: string[]

  constructor(message: string, options?: { status?: number; code?: string; errors?: string[] }) {
    super(message)
    this.name = 'AdminApiError'
    this.status = options?.status ?? 500
    this.code = options?.code
    this.errors = options?.errors
  }
}

interface AdminApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: BodyInit | Record<string, unknown> | null
  headers?: HeadersInit
  accessToken?: string | null
}

const DEFAULT_API_BASE_URL = 'https://api.picsa.pro/api'

export function getAdminApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!configuredBaseUrl) {
    return DEFAULT_API_BASE_URL
  }

  return configuredBaseUrl.replace(/\/$/, '')
}

function buildRequestBody(body: AdminApiRequestOptions['body']) {
  if (
    body == null ||
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body
  }

  return JSON.stringify(body)
}

function buildRequestHeaders(
  body: AdminApiRequestOptions['body'],
  accessToken: string | null | undefined,
  headers: HeadersInit | undefined,
) {
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')

  if (
    body != null &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(typeof body === 'string')
  ) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  return requestHeaders
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const payload = text ? (JSON.parse(text) as ApiSuccessResponse<T> | ApiErrorResponse) : null

  if (!response.ok || payload?.success === false) {
    throw new AdminApiError(payload?.message ?? 'Request failed', {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
      errors: payload && 'errors' in payload ? payload.errors : undefined,
    })
  }

  if (!payload || payload.success !== true) {
    throw new AdminApiError('Invalid response from server', {
      status: response.status,
    })
  }

  return payload as T
}

export async function adminApiRequest<T>(
  path: string,
  options: AdminApiRequestOptions = {},
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${getAdminApiBaseUrl()}${normalizedPath}`, {
    ...options,
    cache: 'no-store',
    headers: buildRequestHeaders(options.body, options.accessToken, options.headers),
    body: buildRequestBody(options.body),
  })

  return parseApiResponse<T>(response)
}

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError
}
