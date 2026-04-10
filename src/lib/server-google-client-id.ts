import { getOAuthClientId } from '@/lib/server-oauth-client-id'

export function getGoogleClientId() {
  return getOAuthClientId('VITE_GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_ID')
}
