import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ClientEventInvitationAcceptPage } from '@/components/client/client-event-invitation-accept-page'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/app/events/invitations/accept')({
  component: ClientEventInvitationAcceptRoute,
})

function ClientEventInvitationAcceptRoute() {
  return (
    <Suspense fallback={<ClientEventInvitationAcceptFallback />}>
      <ClientEventInvitationAcceptPage />
    </Suspense>
  )
}

function ClientEventInvitationAcceptFallback() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">Loading your invitation...</p>
      </div>
    </div>
  )
}
