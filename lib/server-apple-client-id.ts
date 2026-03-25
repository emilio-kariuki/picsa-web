import { getServerOAuthClientId } from '@/lib/server-oauth-client-id'

export function getServerAppleClientId() {
  return getServerOAuthClientId('NEXT_PUBLIC_APPLE_CLIENT_ID', 'APPLE_CLIENT_ID')
}
