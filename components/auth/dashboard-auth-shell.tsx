'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { resolveAdminNextPath } from '@/lib/auth'
import { useAdminAuth } from '@/hooks/use-admin-auth'

export function DashboardAuthShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { bootstrapStatus, isAuthenticated } = useAdminAuth()

  useEffect(() => {
    if (bootstrapStatus !== 'ready' || isAuthenticated) {
      return
    }

    router.replace(`/login?next=${encodeURIComponent(resolveAdminNextPath(pathname))}`)
  }, [bootstrapStatus, isAuthenticated, pathname, router])

  if (bootstrapStatus !== 'ready' || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading admin session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
