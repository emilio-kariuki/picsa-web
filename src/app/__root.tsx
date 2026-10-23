import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  redirect,
} from '@tanstack/react-router'
import { buildAppClipBanner } from '@/lib/app-links'
import appCss from './globals.css?url'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const pathname = location.pathname.replace(/\/$/, '') || '/'
    const event = pathname.match(/^\/app\/events\/([a-zA-Z0-9_-]+)$/)
    if (event && event[1] !== 'new') {
      throw redirect({ to: '/events/$eventId', params: { eventId: event[1] }, search: location.search, statusCode: 308 })
    }
    const publicEvent = pathname !== '/events/new' && /^\/(?:join|events?|camera)\/[a-zA-Z0-9_-]+$/.test(pathname)
    if (!publicEvent && /^\/(?:app|admin|dashboard|login|events|images|notifications|settings|payments|auth)(?:\/|$)/.test(pathname)) {
      throw redirect({ to: '/', hash: 'download', search: {}, statusCode: 308 })
    }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'Picsa' },
      { name: 'apple-itunes-app', content: buildAppClipBanner() },
      {
        name: 'description',
        content: 'Collect and share every photo from your event with Picsa.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/icon-light-32x32.png',
      },
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '180x180',
        href: '/apple-icon.png',
      },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
