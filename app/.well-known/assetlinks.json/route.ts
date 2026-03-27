import { NextResponse } from 'next/server'
import { getAssetLinks } from '@/lib/app-links'

export async function GET() {
  return NextResponse.json(getAssetLinks(), {
    headers: {
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
