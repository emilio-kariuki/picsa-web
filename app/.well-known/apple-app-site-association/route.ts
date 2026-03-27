import { NextResponse } from 'next/server'
import { getAppleAppSiteAssociation } from '@/lib/app-links'

export async function GET() {
  return NextResponse.json(getAppleAppSiteAssociation(), {
    headers: {
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
