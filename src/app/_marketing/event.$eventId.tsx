import { createFileRoute } from '@tanstack/react-router'
import { EventHandoffPage } from '@/components/marketing/event-handoff-page'
import { buildAppClipBanner } from '@/lib/app-links'

export const Route = createFileRoute('/_marketing/event/$eventId')({
  head: ({ params }) => ({
    meta: [
      { title: 'Open your event | Picsa' },
      { name: 'apple-itunes-app', content: buildAppClipBanner(`https://picsa.pro/event/${encodeURIComponent(params.eventId)}`) },
    ],
  }),
  component: EventPage,
})

function EventPage() {
  const { eventId } = Route.useParams()
  return <EventHandoffPage eventId={eventId} />
}
