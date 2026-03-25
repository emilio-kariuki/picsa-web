import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const INTERNAL_PREFIX = '/_sites'
const ADMIN_HOST = 'admin.picsa.pro'
const CLIENT_HOST = 'app.picsa.pro'
const MARKETING_HOST = 'picsa.pro'
const LOCAL_ADMIN_HOST = 'admin.localhost'
const LOCAL_CLIENT_HOST = 'app.localhost'
const LOCAL_MARKETING_HOSTS = new Set(['localhost', '127.0.0.1'])
const MARKETING_ONLY_PATHS = new Set(['/privacy-policy', '/terms-of-service'])

function getHostname(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const hostHeader = forwardedHost ?? request.headers.get('host') ?? ''

  return hostHeader
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
}

function isLocalHost(hostname: string) {
  return hostname.endsWith('.localhost') || LOCAL_MARKETING_HOSTS.has(hostname)
}

function isAdminHost(hostname: string) {
  return hostname === ADMIN_HOST || hostname === LOCAL_ADMIN_HOST
}

function isClientHost(hostname: string) {
  return hostname === CLIENT_HOST || hostname === LOCAL_CLIENT_HOST
}

function isAdminPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
}

function isClientPath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/events' ||
    pathname.startsWith('/events/') ||
    pathname === '/images' ||
    pathname.startsWith('/images/') ||
    pathname === '/notifications' ||
    pathname.startsWith('/notifications/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/')
  )
}

function buildSitePath(site: 'admin' | 'marketing' | 'client', pathname: string) {
  return pathname === '/' ? `${INTERNAL_PREFIX}/${site}` : `${INTERNAL_PREFIX}/${site}${pathname}`
}

function redirectToHost(request: NextRequest, hostname: string) {
  const url = request.nextUrl.clone()
  url.protocol = isLocalHost(hostname) ? 'http' : 'https'
  url.hostname = hostname
  url.port = isLocalHost(hostname) ? request.nextUrl.port : ''
  return NextResponse.redirect(url)
}

function proxy(request: NextRequest) {
  const hostname = getHostname(request)
  const { pathname } = request.nextUrl

  if (pathname === INTERNAL_PREFIX || pathname.startsWith(`${INTERNAL_PREFIX}/`)) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (isAdminHost(hostname)) {
    if (MARKETING_ONLY_PATHS.has(pathname)) {
      const targetHost = hostname === LOCAL_ADMIN_HOST ? 'localhost' : MARKETING_HOST
      return redirectToHost(request, targetHost)
    }

    const url = request.nextUrl.clone()
    url.pathname = buildSitePath('admin', pathname)
    return NextResponse.rewrite(url)
  }

  if (isClientHost(hostname)) {
    if (MARKETING_ONLY_PATHS.has(pathname)) {
      const targetHost = hostname === LOCAL_CLIENT_HOST ? 'localhost' : MARKETING_HOST
      return redirectToHost(request, targetHost)
    }

    const url = request.nextUrl.clone()
    url.pathname = buildSitePath('client', pathname)
    return NextResponse.rewrite(url)
  }

  if (isAdminPath(pathname)) {
    const targetHost = isLocalHost(hostname) ? LOCAL_ADMIN_HOST : ADMIN_HOST
    return redirectToHost(request, targetHost)
  }

  if (isClientPath(pathname)) {
    const targetHost = isLocalHost(hostname) ? LOCAL_CLIENT_HOST : CLIENT_HOST
    return redirectToHost(request, targetHost)
  }

  const url = request.nextUrl.clone()
  url.pathname = buildSitePath('marketing', pathname)
  return NextResponse.rewrite(url)
}

export { proxy }
export default proxy

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
