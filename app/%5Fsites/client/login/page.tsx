import { ClientLoginPageContent } from '@/components/auth/client-login-page-content'
import { resolveClientNextPath } from '@/lib/client-auth'
import { getServerGoogleClientId } from '@/lib/server-google-client-id'

interface ClientLoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextValue = resolvedSearchParams?.next
  const nextPath = resolveClientNextPath(Array.isArray(nextValue) ? nextValue[0] : nextValue)
  const googleClientId = getServerGoogleClientId()

  return <ClientLoginPageContent nextPath={nextPath} googleClientId={googleClientId} />
}
