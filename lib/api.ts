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

export class ApiError extends Error {
  status: number
  code?: string
  errors?: string[]

  constructor(message: string, options?: { status?: number; code?: string; errors?: string[] }) {
    super(message)
    this.name = 'ApiError'
    this.status = options?.status ?? 500
    this.code = options?.code
    this.errors = options?.errors
  }
}

interface AdminApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: BodyInit | object | null
  headers?: HeadersInit
  accessToken?: string | null
}

const DEFAULT_API_BASE_URL = 'https://picsa.ecoville.online/api'

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/$/, '')

  if (!trimmedBaseUrl) {
    return DEFAULT_API_BASE_URL
  }

  try {
    const url = new URL(trimmedBaseUrl)
    const normalizedPathname = url.pathname.replace(/\/$/, '')

    if (!normalizedPathname || normalizedPathname === '/') {
      url.pathname = '/api'
    }

    return url.toString().replace(/\/$/, '')
  } catch {
    if (trimmedBaseUrl.endsWith('/api')) {
      return trimmedBaseUrl
    }

    return `${trimmedBaseUrl}/api`
  }
}

export function getAdminApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!configuredBaseUrl) {
    return normalizeApiBaseUrl(DEFAULT_API_BASE_URL)
  }

  return normalizeApiBaseUrl(configuredBaseUrl)
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
    throw new ApiError(payload?.message ?? 'Request failed', {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
      errors: payload && 'errors' in payload ? payload.errors : undefined,
    })
  }

  if (!payload || payload.success !== true) {
    throw new ApiError('Invalid response from server', {
      status: response.status,
    })
  }

  return payload as T
}

export async function apiRequest<T>(
  path: string,
  options: AdminApiRequestOptions = {},
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  let response: Response

  try {
    response = await fetch(`${getAdminApiBaseUrl()}${normalizedPath}`, {
      ...options,
      cache: 'no-store',
      headers: buildRequestHeaders(options.body, options.accessToken, options.headers),
      body: buildRequestBody(options.body),
    })
  } catch {
    throw new ApiError(
      'Unable to reach the API. Check NEXT_PUBLIC_API_BASE_URL and make sure the backend allows requests from this web app.',
      {
        status: 0,
      },
    )
  }

  return parseApiResponse<T>(response)
}

export function adminApiRequest<T>(
  path: string,
  options: AdminApiRequestOptions = {},
) {
  return apiRequest<T>(path, options)
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export const AdminApiError = ApiError

export function isAdminApiError(error: unknown): error is ApiError {
  return isApiError(error)
}
