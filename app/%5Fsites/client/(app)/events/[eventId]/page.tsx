import { ClientEventWorkspacePage } from '@/components/client/client-event-workspace-page'
import { MobileAppHandoff } from '@/components/shared/mobile-app-handoff'
import { buildEventDeepLink } from '@/lib/app-links'

interface ClientEventWorkspaceRouteProps {
  params: Promise<{
    eventId: string
  }>
}

export default async function ClientEventWorkspaceRoute(props: ClientEventWorkspaceRouteProps) {
  const { eventId } = await props.params

  return (
    <>
      <MobileAppHandoff
        deepLinkHref={buildEventDeepLink(eventId)}
        title="Opening Picsa in the app"
        description="If Picsa is installed on this phone, we’ll hand this event over automatically. If the app does not open, you can continue in the browser instead."
        variant="overlay"
      />
      <ClientEventWorkspacePage eventId={eventId} />
    </>
  )
}
