import { getServerOAuthClientId } from '@/lib/server-oauth-client-id'

export function getServerGoogleClientId() {
  return getServerOAuthClientId('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_ID')
}
