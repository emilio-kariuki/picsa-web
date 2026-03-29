'use client'

import { useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ClientEventForm } from '@/components/client/client-event-form'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  createEvent,
  createEventPassCheckoutSession,
  fetchAppConfig,
  fetchEventPassCheckoutStatus,
  fetchEventPasses,
} from '@/lib/client-api'
import type { ClientEventInput } from '@/lib/client-types'

export default function NewClientEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { performAuthenticatedRequest } = useClientAuth()
  const checkoutIntentId = searchParams.get('checkoutIntentId')

  const appConfigQuery = useQuery({
    queryKey: ['client', 'app-config'],
    queryFn: fetchAppConfig,
  })

  const eventPassesQuery = useQuery({
    queryKey: ['client', 'event-passes'],
    queryFn: () => performAuthenticatedRequest((token) => fetchEventPasses(token)),
  })

  const restoredCheckoutQuery = useQuery({
    queryKey: ['client', 'checkout-session-status', checkoutIntentId],
    enabled: Boolean(checkoutIntentId),
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        fetchEventPassCheckoutStatus(token, checkoutIntentId!),
      ),
  })

  const createEventMutation = useMutation({
    mutationFn: async (input: ClientEventInput) => {
      if (!input.unlockWithEventPass) {
        const event = await performAuthenticatedRequest((token) => createEvent(token, input))

        return {
          kind: 'created' as const,
          eventId: event.id,
        }
      }

      const passInventory =
        eventPassesQuery.data ??
        (await performAuthenticatedRequest((token) => fetchEventPasses(token)))

      if (passInventory.availableCount > 0) {
        const event = await performAuthenticatedRequest((token) =>
          createEvent(token, {
            ...input,
            unlockWithEventPass: true,
          }),
        )

        return {
          kind: 'created' as const,
          eventId: event.id,
        }
      }

      const checkout = await performAuthenticatedRequest((token) =>
        createEventPassCheckoutSession(token, {
          flow: 'create_event_pro',
          draftEvent: input,
          returnPath: '/payments/return',
        }),
      )

      if (checkout.mode === 'existing_pass') {
        const event = await performAuthenticatedRequest((token) =>
          createEvent(token, {
            ...input,
            unlockWithEventPass: true,
          }),
        )

        return {
          kind: 'created' as const,
          eventId: event.id,
        }
      }

      if (checkout.mode === 'checkout' && checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl)

        return {
          kind: 'redirected' as const,
        }
      }

      throw new Error('Unable to start Pro checkout')
    },
    onSuccess: (result) => {
      if (result.kind === 'created') {
        toast.success('Event created')
        router.push(`/events/${result.eventId}`)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to create event')
    },
  })

  const restoredDraft = useMemo(() => {
    if (restoredCheckoutQuery.data?.flow !== 'create_event_pro') {
      return null
    }

    return restoredCheckoutQuery.data.draftEvent
  }, [restoredCheckoutQuery.data])

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

        {checkoutIntentId && restoredCheckoutQuery.data ? (
          <div className="mb-8 rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Checkout draft</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Your event draft has been restored</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {restoredCheckoutQuery.data.status === 'CANCELLED'
                ? 'Checkout was cancelled, so nothing was created. You can keep editing below and try again whenever you are ready.'
                : restoredCheckoutQuery.data.status === 'FAILED'
                  ? restoredCheckoutQuery.data.errorMessage ?? 'Checkout did not finish successfully, so the draft is still here for you to adjust and retry.'
                  : 'We pulled your most recent event draft back into the form so you can continue from where you left off.'}
            </p>
          </div>
        ) : null}

        <ClientEventForm
          appConfig={appConfigQuery.data}
          availablePassCount={eventPassesQuery.data?.availableCount ?? 0}
          initialInput={restoredDraft}
          isSubmitting={createEventMutation.isPending}
          mode="create"
          submitLabel={createEventMutation.isPending ? 'Working...' : undefined}
          onSubmit={async (input) => {
            await createEventMutation.mutateAsync(input)
          }}
        />
      </ClientSurface>
    </div>
  )
}
