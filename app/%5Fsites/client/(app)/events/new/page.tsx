'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ClientEventForm } from '@/components/client/client-event-form'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import { createEvent, fetchAppConfig } from '@/lib/client-api'
import type { ClientEventInput } from '@/lib/client-types'

export default function NewClientEventPage() {
  const router = useRouter()
  const { performAuthenticatedRequest } = useClientAuth()

  const appConfigQuery = useQuery({
    queryKey: ['client', 'app-config'],
    queryFn: fetchAppConfig,
  })

  const createEventMutation = useMutation({
    mutationFn: (input: ClientEventInput) =>
      performAuthenticatedRequest((token) => createEvent(token, input)),
    onSuccess: (event) => {
      toast.success('Event created')
      router.push(`/events/${event.id}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to create event')
    },
  })

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="New event"
        title="Shape the next memory space"
        description="Create an event that feels curated from the start, then decide how guests join, upload, and share."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ClientMetricCard
          label="Free guest limit"
          value={String(appConfigQuery.data?.plan.freeEventMaxGuests ?? '...')}
          helper="Upgrade later if the room needs to grow."
        />
        <ClientMetricCard
          label="Free image limit"
          value={String(appConfigQuery.data?.plan.freeEventMaxImages ?? '...')}
          helper="A useful baseline for your first gallery."
        />
        <ClientMetricCard
          label="Batch uploads"
          value={String(appConfigQuery.data?.uploads.imageBatchMaxFiles ?? '...')}
          helper="Maximum images the web gallery accepts in one batch."
        />
      </div>

      <ClientSurface className="overflow-hidden">
        <div className="mb-8 rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">A warm, intentional setup pays off later.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Clear join rules and moderation settings help the gallery feel effortless for guests while keeping you in control.
              </p>
            </div>
          </div>
        </div>

        <ClientEventForm
          submitLabel={createEventMutation.isPending ? 'Creating event...' : 'Create event'}
          isSubmitting={createEventMutation.isPending}
          onSubmit={async (input) => {
            await createEventMutation.mutateAsync(input)
          }}
        />
      </ClientSurface>
    </div>
  )
}
