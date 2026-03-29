'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, CheckCircle2Icon, LoaderCircleIcon, SmartphoneIcon, XCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import { fetchEventPassCheckoutStatus } from '@/lib/client-api'
import { buildPaymentsAppReturnUrl, isProbablyMobileUserAgent } from '@/lib/payment-return-link'

function statusCopy(status: string) {
  switch (status) {
    case 'SUCCEEDED':
      return {
        title: 'Payment confirmed',
        description: 'We are moving you into the event workspace now.',
      }
    case 'FAILED':
      return {
        title: 'Payment did not complete',
        description: 'Nothing was created, and your draft is still safe to restore.',
      }
    case 'CANCELLED':
      return {
        title: 'Checkout was cancelled',
        description: 'No event was created. You can return to the draft and try again later.',
      }
    case 'PROCESSING':
      return {
        title: 'Payment is processing',
        description: 'We are still waiting for the final payment confirmation from Dodo.',
      }
    case 'PENDING':
    default:
      return {
        title: 'Checking payment status',
        description: 'Stay on this page for a moment while we confirm the checkout result.',
      }
  }
}

export default function ClientPaymentsReturnPage() {
  const { performAuthenticatedRequest } = useClientAuth()
  const hasRedirectedRef = useRef(false)
  const hasAttemptedAppOpenRef = useRef(false)
  const searchParams = useSearchParams()
  const checkoutIntentId = searchParams.get('checkoutIntentId')
  const openAppHref = useMemo(
    () => buildPaymentsAppReturnUrl(searchParams),
    [searchParams],
  )
  const [shouldPreferAppHandoff, setShouldPreferAppHandoff] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setShouldPreferAppHandoff(
      isProbablyMobileUserAgent(window.navigator.userAgent),
    )
  }, [])

  useEffect(() => {
    if (
      !shouldPreferAppHandoff ||
      !checkoutIntentId ||
      hasAttemptedAppOpenRef.current
    ) {
      return
    }

    hasAttemptedAppOpenRef.current = true
    const timer = window.setTimeout(() => {
      window.location.assign(openAppHref)
    }, 280)

    return () => {
      window.clearTimeout(timer)
    }
  }, [checkoutIntentId, openAppHref, shouldPreferAppHandoff])

  const checkoutStatusQuery = useQuery({
    queryKey: ['client', 'payments-return', checkoutIntentId],
    enabled: Boolean(checkoutIntentId),
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        fetchEventPassCheckoutStatus(token, checkoutIntentId!),
      ),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'PENDING' || status === 'PROCESSING' ? 2500 : false
    },
  })

  useEffect(() => {
    if (!checkoutStatusQuery.data || hasRedirectedRef.current) {
      return
    }

    if (
      !shouldPreferAppHandoff &&
      checkoutStatusQuery.data.status === 'SUCCEEDED' &&
      checkoutStatusQuery.data.eventId
    ) {
      hasRedirectedRef.current = true
      toast.success('Pro unlocked successfully')
      window.setTimeout(() => {
        window.location.replace(`/events/${checkoutStatusQuery.data?.eventId}`)
      }, 600)
    }
  }, [checkoutStatusQuery.data, shouldPreferAppHandoff])

  if (!checkoutIntentId) {
    return (
      <ClientSurface className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Payment return</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">Missing checkout reference</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          We could not find the payment session to resume. Head back to your events workspace and try again from there.
        </p>
        <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/events">Back to events</Link>
        </Button>
      </ClientSurface>
    )
  }

  if (checkoutStatusQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Checking payment status...</p>
        </div>
      </div>
    )
  }

  if (checkoutStatusQuery.isError || !checkoutStatusQuery.data) {
    return (
      <ClientSurface className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Payment return</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">We could not confirm the payment</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {checkoutStatusQuery.error instanceof Error
            ? checkoutStatusQuery.error.message
            : 'Try reloading this page in a moment.'}
        </p>
        <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/events">Back to events</Link>
        </Button>
      </ClientSurface>
    )
  }

  const session = checkoutStatusQuery.data
  const copy = statusCopy(session.status)
  const restoreHref =
    session.flow === 'create_event_pro'
      ? `/events/new?checkoutIntentId=${encodeURIComponent(session.checkoutIntentId)}`
      : session.eventId
        ? `/events/${session.eventId}`
        : '/events'

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="Payment return"
        title={copy.title}
        description={copy.description}
      />

      <ClientSurface>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/70">
              {session.status === 'SUCCEEDED' ? (
                <CheckCircle2Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
              ) : session.status === 'FAILED' || session.status === 'CANCELLED' ? (
                <XCircleIcon className="h-7 w-7 text-rose-600 dark:text-rose-300" />
              ) : (
                <LoaderCircleIcon className="h-7 w-7 animate-spin text-accent" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Flow</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {session.flow === 'create_event_pro' ? 'Create event as Pro' : 'Upgrade existing event'}
              </p>
            </div>

            {shouldPreferAppHandoff ? (
              <div className="rounded-[1.25rem] border border-border/70 bg-secondary/40 px-4 py-4 text-sm text-muted-foreground">
                We&apos;re trying to reopen Picsa now. If the app stays closed, tap{' '}
                <span className="font-medium text-foreground">Open Picsa app</span> below.
              </div>
            ) : null}

            {session.errorMessage ? (
              <div className="rounded-[1.25rem] border border-rose-300/60 bg-rose-500/5 px-4 py-4 text-sm text-muted-foreground">
                {session.errorMessage}
              </div>
            ) : null}
          </div>

          <div className="w-full max-w-md rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Payment details</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-foreground">{session.status}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Available passes</dt>
                <dd className="font-medium text-foreground">{session.availablePassCount}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Checkout reference</dt>
                <dd className="break-all text-right font-medium text-foreground">
                  {session.checkoutSessionId ?? session.checkoutIntentId}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {shouldPreferAppHandoff ? (
            <a
              href={openAppHref}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <SmartphoneIcon className="mr-2 h-4 w-4" />
              Open Picsa app
            </a>
          ) : null}

          {session.status === 'SUCCEEDED' && session.eventId ? (
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              <Link href={`/events/${session.eventId}`}>
                Open event workspace
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              <Link href={restoreHref}>
                {session.flow === 'create_event_pro' ? 'Back to draft' : 'Back to event'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" className="rounded-full border-border/80 bg-background/70">
            <Link href="/events">All events</Link>
          </Button>
        </div>
      </ClientSurface>
    </div>
  )
}
