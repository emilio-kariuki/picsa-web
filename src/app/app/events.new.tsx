import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ClientNewEventPage } from '@/components/client/client-new-event-page'
import { Spinner } from '@/components/ui/spinner'

function NewClientEventPage() {
  return (
    <Suspense fallback={<NewClientEventFallback />}>
      <ClientNewEventPage />
    </Suspense>
  )
}

function NewClientEventFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">Preparing the event form...</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/app/events/new')({
  component: NewClientEventPage,
})

