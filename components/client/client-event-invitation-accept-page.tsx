'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRightIcon, CheckCircle2Icon, MailCheckIcon } from '@/components/ui/icons'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import { acceptEventInvitation } from '@/lib/client-api'
import { isApiError } from '@/lib/api'
import { resolveClientNextPath } from '@/lib/client-auth'

export function ClientEventInvitationAcceptPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useClientAuth()
  const attemptedTokenRef = useRef<string | null>(null)
  const token = searchParams.get('token')?.trim() ?? ''
  const searchText = searchParams.toString()
  const nextPath = resolveClientNextPath(
    searchText ? `${pathname}?${searchText}` : pathname,
  )

  const acceptInvitationMutation = useMutation({
    mutationFn: () =>
      performAuthenticatedRequest((accessToken) =>
        acceptEventInvitation(accessToken, token),
      ),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation accepted successfully')
      router.replace(`/events/${response.data.event.id}`)
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 401) {
        return
      }

      toast.error(error instanceof Error ? error.message : 'Unable to accept invitation')
    },
  })

  useEffect(() => {
    if (!token || bootstrapStatus !== 'ready') {
      return
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }

    if (attemptedTokenRef.current === token) {
      return
    }

    attemptedTokenRef.current = token
    acceptInvitationMutation.mutate()
  }, [
    acceptInvitationMutation,
    bootstrapStatus,
    isAuthenticated,
    nextPath,
    router,
    token,
  ])

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div className="w-full space-y-6">
          <ClientPageHeader
            eyebrow="Invitation"
            title="This invitation link is missing its token"
            description="Open the original invite email again, or ask the host to send you a fresh invitation link."
          />

          <ClientSurface className="max-w-2xl">
            <div className="flex flex-col gap-4">
              <Alert className="rounded-[1.35rem] border-border/70 bg-secondary/40">
                <AlertTitle>Missing invitation token</AlertTitle>
                <AlertDescription>
                  We could not find the secure token needed to accept this invitation.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  <Link href="/login">
                    Go to login
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ClientSurface>
        </div>
      </div>
    )
  }

  if (bootstrapStatus !== 'ready' || !isAuthenticated || acceptInvitationMutation.isPending) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div className="w-full space-y-6">
          <ClientPageHeader
            eyebrow="Invitation"
            title="We’re opening your event invitation"
            description={
              !isAuthenticated && bootstrapStatus === 'ready'
                ? 'You need to sign in before we can attach this invitation to your account.'
                : 'Hold on for a moment while we verify the invitation and add you to the event.'
            }
          />

          <ClientSurface className="max-w-2xl">
            <div className="flex flex-col items-start gap-5 rounded-[1.5rem] border border-border/70 bg-secondary/35 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                {bootstrapStatus !== 'ready' || acceptInvitationMutation.isPending ? (
                  <Spinner className="size-6" />
                ) : (
                  <MailCheckIcon className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-2">
                <p className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                  {bootstrapStatus !== 'ready'
                    ? 'Preparing your invitation'
                    : !isAuthenticated
                      ? 'Redirecting you to sign in'
                      : 'Accepting invitation'}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {bootstrapStatus !== 'ready'
                    ? 'We are checking your current Picsa session first.'
                    : !isAuthenticated
                      ? 'After you sign in, we’ll bring you right back here and finish joining the event.'
                      : 'Once the invitation is accepted, we’ll take you straight into the event workspace.'}
                </p>
              </div>
            </div>
          </ClientSurface>
        </div>
      </div>
    )
  }

  if (acceptInvitationMutation.isError) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div className="w-full space-y-6">
          <ClientPageHeader
            eyebrow="Invitation"
            title="We couldn’t accept this invitation"
            description="The link may be expired, revoked, already used, or attached to a different account than the invited email."
          />

          <ClientSurface className="max-w-2xl">
            <div className="space-y-5">
              <Alert variant="destructive" className="rounded-[1.35rem]">
                <AlertTitle>Invitation unavailable</AlertTitle>
                <AlertDescription>
                  {acceptInvitationMutation.error instanceof Error
                    ? acceptInvitationMutation.error.message
                    : 'Unable to accept invitation right now.'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    attemptedTokenRef.current = null
                    acceptInvitationMutation.reset()
                  }}
                >
                  Try again
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-border/80 bg-background/70"
                >
                  <Link href="/events">Go to events</Link>
                </Button>
              </div>
            </div>
          </ClientSurface>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
      <div className="w-full space-y-6">
        <ClientPageHeader
          eyebrow="Invitation"
          title="Invitation accepted"
          description="We’re taking you into the event now."
        />

        <ClientSurface className="max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2Icon className="h-7 w-7" />
            </div>
            <div>
              <p className="font-medium text-foreground">Your access is ready.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                If the redirect doesn’t happen automatically, use the button below.
              </p>
            </div>
          </div>

          <Button
            className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              const eventId = acceptInvitationMutation.data?.data.event.id

              if (eventId) {
                router.replace(`/events/${eventId}`)
              }
            }}
          >
            Open event
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </ClientSurface>
      </div>
    </div>
  )
}
