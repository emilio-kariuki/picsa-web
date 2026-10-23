import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PORTAL_HOSTS = new Set([
  'admin.picsa.pro', 'app.picsa.pro', 'admin.localhost', 'app.localhost',
])
const PUBLIC_PAGES = new Set([
  '/delete-account', '/privacy-policy', '/terms-of-service',
])
const PUBLIC_EVENT_PATH = /^\/(?:join|events?|camera)\/[a-zA-Z0-9_-]+$/
const PORTAL_PATH = /^\/(?:app|admin|dashboard|login|events|images|notifications|settings|payments|auth)(?:\/|$)/

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, '') || '/'
  if (pathname === '/_sites' || pathname.startsWith('/_sites/')) {
    return new NextResponse('Not found', { status: 404 })
  }
  if (pathname === '/apple-app-site-association') return NextResponse.next()

  const hostname = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '')
    .split(',')[0].trim().split(':')[0].toLowerCase()
  const portalHost = PORTAL_HOSTS.has(hostname)
  const publicEvent = pathname !== '/events/new' && PUBLIC_EVENT_PATH.test(pathname)
  const portalPath = !publicEvent && PORTAL_PATH.test(pathname)
  if (!portalHost && !portalPath) return NextResponse.next()

  const target = request.nextUrl.clone()
  if (portalHost) {
    const local = hostname.endsWith('.localhost')
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
