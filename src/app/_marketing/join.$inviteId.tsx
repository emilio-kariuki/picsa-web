import { createFileRoute } from '@tanstack/react-router'
import { EventHandoffPage } from '@/components/marketing/event-handoff-page'
import { buildAppClipBanner } from '@/lib/app-links'

export const Route = createFileRoute('/_marketing/join/$inviteId')({
  head: ({ params }) => ({
    meta: [
      { title: 'Open your event | Picsa' },
      { name: 'apple-itunes-app', content: buildAppClipBanner(`https://picsa.pro/join/${encodeURIComponent(params.inviteId)}`) },
    ],
  }),
  component: EventPage,
})

function EventPage() {
  const { inviteId } = Route.useParams()
  return <EventHandoffPage eventId={inviteId} join />
}
