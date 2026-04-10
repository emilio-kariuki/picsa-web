import { getOAuthClientId } from '@/lib/server-oauth-client-id'

export function getAppleClientId() {
  return getOAuthClientId('VITE_APPLE_CLIENT_ID', 'APPLE_CLIENT_ID')
}
