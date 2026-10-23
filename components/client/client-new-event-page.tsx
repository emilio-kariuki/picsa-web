'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SparklesIcon } from '@/components/ui/icons'
import { toast } from 'sonner'
import { ClientEventForm } from '@/components/client/client-event-form'
import {
  ClientMetricCard,
  ClientPageHeader,
  ClientSurface,
} from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  createEvent,
  fetchAppConfig,
  fetchEventPasses,
} from '@/lib/client-api'
import type { ClientEventInput } from '@/lib/client-types'

export function ClientNewEventPage() {
  const router = useRouter()
  const { performAuthenticatedRequest } = useClientAuth()

  const appConfigQuery = useQuery({
    queryKey: ['client', 'app-config'],
    queryFn: fetchAppConfig,
  })

  const eventPassesQuery = useQuery({
    queryKey: ['client', 'event-passes'],
    queryFn: () => performAuthenticatedRequest((token) => fetchEventPasses(token)),
  })

  const createEventMutation = useMutation({
    mutationFn: async (input: ClientEventInput) => {
      if (input.unlockWithEventPass) {
        const passes = await performAuthenticatedRequest((token) => fetchEventPasses(token))
        if (passes.availableCount === 0) {
          throw new Error('Create a free event, then open it in the Picsa mobile app to purchase Pro.')
        }
      }

      return performAuthenticatedRequest((token) => createEvent(token, input))
    },
    onSuccess: (event) => {
      toast.success('Event created')
      router.push(`/events/${event.id}`)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Unable to create event',
      )
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
              <p className="font-medium text-foreground">
                A warm, intentional setup pays off later.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Clear join rules and moderation settings help the gallery feel
                effortless for guests while keeping you in control.
              </p>
            </div>
          </div>
        </div>

        <ClientEventForm
          appConfig={appConfigQuery.data}
          availablePassCount={eventPassesQuery.data?.availableCount ?? 0}
          isSubmitting={createEventMutation.isPending}
          mode="create"
          submitLabel={createEventMutation.isPending ? 'Working...' : undefined}
          onSubmit={async (input) => {
            createEventMutation.mutate(input)
          }}
        />
      </ClientSurface>
    </div>
  )
}
