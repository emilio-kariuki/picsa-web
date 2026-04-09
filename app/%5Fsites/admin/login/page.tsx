import { LoginPageContent } from '@/components/auth/login-page-content'
import { resolveAdminNextPath } from '@/lib/auth'
import { getServerGoogleClientId } from '@/lib/server-google-client-id'

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextValue = resolvedSearchParams?.next
  const nextPath = resolveAdminNextPath(
    Array.isArray(nextValue) ? nextValue[0] : nextValue,
  )
  const googleClientId = getServerGoogleClientId()

  return (
    <LoginPageContent nextPath={nextPath} googleClientId={googleClientId} />
  )
}
