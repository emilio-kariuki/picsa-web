import { ClientLoginPageContent } from '@/components/auth/client-login-page-content'
import { resolveClientNextPath } from '@/lib/client-auth'

interface ClientLoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextValue = resolvedSearchParams?.next
  const nextPath = resolveClientNextPath(Array.isArray(nextValue) ? nextValue[0] : nextValue)

  return <ClientLoginPageContent nextPath={nextPath} />
}
