import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const INTERNAL_PREFIX = '/_sites'
const ADMIN_HOSTS = new Set(['admin.picsa.pro', 'admin.localhost'])
const CLIENT_HOSTS = new Set(['app.picsa.pro', 'app.localhost'])
const LOCAL_MARKETING_HOSTS = new Set(['localhost', '127.0.0.1'])
const PUBLIC_PAGES = new Set([
  '/delete-account', '/privacy-policy', '/terms-of-service',
])
const PUBLIC_EVENT_PATH = /^\/(?:join|events?|camera)\/[a-zA-Z0-9_-]+$/
const ADMIN_PATH = /^\/(?:dashboard|admin)(?:\/|$)/
const RETIRED_PORTAL_PATH = /^\/(?:app|login|events|images|notifications|settings|payments|auth)(?:\/|$)/

function isLocalHost(hostname: string) {
  return hostname.endsWith('.localhost') || LOCAL_MARKETING_HOSTS.has(hostname)
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, '') || '/'
  if (pathname === INTERNAL_PREFIX || pathname.startsWith(`${INTERNAL_PREFIX}/`)) {
    return new NextResponse('Not found', { status: 404 })
  }
  if (pathname === '/apple-app-site-association') return NextResponse.next()

  const hostname = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '')
    .split(',')[0].trim().split(':')[0].toLowerCase()
  const publicEvent = pathname !== '/events/new' && PUBLIC_EVENT_PATH.test(pathname)
  const local = isLocalHost(hostname)

  if (ADMIN_HOSTS.has(hostname)) {
    if (publicEvent || PUBLIC_PAGES.has(pathname)) {
      const target = request.nextUrl.clone()
      target.protocol = local ? 'http' : 'https'
      target.hostname = local ? 'localhost' : 'picsa.pro'
      target.port = local ? request.nextUrl.port : ''
      return NextResponse.redirect(target, 308)
    }

    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? `${INTERNAL_PREFIX}/admin` : `${INTERNAL_PREFIX}/admin${pathname}`
    return NextResponse.rewrite(url)
  }

  const clientHost = CLIENT_HOSTS.has(hostname)
  if (!clientHost && ADMIN_PATH.test(pathname)) {
    const target = request.nextUrl.clone()
    target.protocol = local ? 'http' : 'https'
    target.hostname = local ? 'admin.localhost' : 'admin.picsa.pro'
    target.port = local ? request.nextUrl.port : ''
    if (pathname === '/admin') {
      target.pathname = '/'
    } else if (pathname.startsWith('/admin/')) {
      target.pathname = pathname.slice('/admin'.length)
    }
    return NextResponse.redirect(target, 308)
  }

  const retiredPortalPath = !publicEvent && RETIRED_PORTAL_PATH.test(pathname)
  if (!clientHost && !retiredPortalPath) return NextResponse.next()

  const target = request.nextUrl.clone()
  if (clientHost) {
    target.protocol = local ? 'http' : 'https'
    target.hostname = local ? 'localhost' : 'picsa.pro'
    target.port = local ? request.nextUrl.port : ''
  }
  if (!publicEvent && !PUBLIC_PAGES.has(pathname)) {
    target.pathname = '/'
    target.search = ''
    target.hash = 'download'
  }
  return NextResponse.redirect(target, 308)
}

export default proxy

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
