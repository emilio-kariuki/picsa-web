import { createFileRoute } from '@tanstack/react-router'
import { getAppleAppSiteAssociation } from '@/lib/app-links'

export const Route = createFileRoute('/api/well-known/apple-app-site-association')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(getAppleAppSiteAssociation(), {
          headers: {
            'cache-control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      },
    },
  },
})
