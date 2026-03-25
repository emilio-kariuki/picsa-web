import { ClientEventWorkspacePage } from '@/components/client/client-event-workspace-page'

interface ClientEventWorkspaceRouteProps {
  params: Promise<{
    eventId: string
  }>
}

export default async function ClientEventWorkspaceRoute(props: ClientEventWorkspaceRouteProps) {
  const { eventId } = await props.params

  return <ClientEventWorkspacePage eventId={eventId} />
}
