import { createFileRoute } from '@tanstack/react-router'
import { LoginPageContent } from '@/components/auth/login-page-content'
import { resolveAdminNextPath } from '@/lib/auth'
import { getGoogleClientId } from '@/lib/server-google-client-id'

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
})

function AdminLoginPage() {
  const { next: nextValue } = Route.useSearch()
  const nextPath = resolveAdminNextPath(nextValue)
  const googleClientId = getGoogleClientId()

  return (
    <LoginPageContent nextPath={nextPath} googleClientId={googleClientId} />
  )
}
