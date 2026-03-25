'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { useClientAuth } from '@/hooks/use-client-auth'
import { resolveClientNextPath } from '@/lib/client-auth'

export function ClientAuthShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { bootstrapStatus, isAuthenticated } = useClientAuth()

  useEffect(() => {
    if (bootstrapStatus !== 'ready' || isAuthenticated) {
      return
    }

    router.replace(`/login?next=${encodeURIComponent(resolveClientNextPath(pathname))}`)
  }, [bootstrapStatus, isAuthenticated, pathname, router])

  if (bootstrapStatus !== 'ready' || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading your Picsa workspace...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
