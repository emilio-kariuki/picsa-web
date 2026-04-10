import { createFileRoute } from '@tanstack/react-router'
import { ClientLoginPageContent } from '@/components/auth/client-login-page-content'
import { resolveClientNextPath } from '@/lib/client-auth'
import { getAppleClientId } from '@/lib/server-apple-client-id'
import { getGoogleClientId } from '@/lib/server-google-client-id'

export const Route = createFileRoute('/app/login')({
  component: ClientLoginPage,
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
})

function ClientLoginPage() {
  const { next: nextValue } = Route.useSearch()
  const nextPath = resolveClientNextPath(nextValue)
  const appleClientId = getAppleClientId()
  const googleClientId = getGoogleClientId()

  return (
    <ClientLoginPageContent
      nextPath={nextPath}
      appleClientId={appleClientId}
      googleClientId={googleClientId}
    />
  )
}
