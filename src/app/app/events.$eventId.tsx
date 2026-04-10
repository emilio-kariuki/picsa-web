import { createFileRoute } from '@tanstack/react-router'
import { ClientEventWorkspacePage } from '@/components/client/client-event-workspace-page'
import { MobileAppHandoff } from '@/components/shared/mobile-app-handoff'
import { buildEventDeepLink } from '@/lib/app-links'

export const Route = createFileRoute('/app/events/$eventId')({
  component: ClientEventWorkspaceRoute,
})

function ClientEventWorkspaceRoute() {
  const { eventId } = Route.useParams()

  return (
    <>
      <MobileAppHandoff
        deepLinkHref={buildEventDeepLink(eventId)}
        title="Opening Picsa in the app"
        description="If Picsa is installed on this phone, we'll hand this event over automatically. If the app does not open, you can continue in the browser instead."
        variant="overlay"
      />
      <ClientEventWorkspacePage eventId={eventId} />
    </>
  )
}
