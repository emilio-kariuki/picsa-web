import { createFileRoute } from '@tanstack/react-router'
import { getAssetLinks } from '@/lib/app-links'

export const Route = createFileRoute('/api/well-known/assetlinks')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(getAssetLinks(), {
          headers: {
            'cache-control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      },
    },
  },
})
