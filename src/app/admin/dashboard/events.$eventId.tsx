import { createFileRoute } from '@tanstack/react-router'
import { EventDetailsPageContent } from '@/components/events/event-details-page-content'

export const Route = createFileRoute('/admin/dashboard/events/$eventId')({
  component: EventDetailsPage,
})

function EventDetailsPage() {
  const { eventId } = Route.useParams()
  return <EventDetailsPageContent eventId={eventId} />
}
