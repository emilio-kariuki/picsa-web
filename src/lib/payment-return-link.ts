type ReadonlyURLSearchParams = URLSearchParams

type SearchParamsLike =
  | URLSearchParams
  | ReadonlyURLSearchParams
  | string
  | null
  | undefined

function toSearchParams(searchParams: SearchParamsLike) {
  if (typeof searchParams === 'string') {
    return new URLSearchParams(searchParams)
  }

  if (searchParams == null) {
    return new URLSearchParams()
  }

  return new URLSearchParams(searchParams.toString())
}

export function buildPaymentsAppReturnUrl(searchParams: SearchParamsLike) {
  const params = toSearchParams(searchParams)
  const query = params.toString()

  return `customscheme://payments/return${query ? `?${query}` : ''}`
}

export function isProbablyMobileUserAgent(userAgent?: string | null) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent ?? '')
}
