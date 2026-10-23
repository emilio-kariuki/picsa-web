import { createFileRoute } from '@tanstack/react-router'
import { getAssetLinks } from '@/lib/app-links'

export const Route = createFileRoute('/.well-known/assetlinks.json')({
  server: {
    handlers: {
      GET: () => Response.json(getAssetLinks(), {
        headers: { 'cache-control': 'public, max-age=3600, s-maxage=3600' },
      }),
    },
  },
})
