import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import appCss from './globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'Picsa' },
      {
        name: 'description',
        content: 'Picsa brings event memories and admin operations into one platform.',
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
