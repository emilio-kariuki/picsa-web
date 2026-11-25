import { EventDetailsPageContent } from '@/components/events/event-details-page-content'

interface EventDetailsPageProps {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventDetailsPage(
  props: EventDetailsPageProps,
) {
  const { eventId } = await props.params

  return <EventDetailsPageContent eventId={eventId} />
}
