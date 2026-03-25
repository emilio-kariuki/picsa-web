'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { ClientGoogleSignIn } from '@/components/client/client-google-sign-in'
import { ApiError, isApiError } from '@/lib/api'
import { useClientAuth } from '@/hooks/use-client-auth'

interface ClientLoginPageContentProps {
  nextPath: string
}

export function ClientLoginPageContent({ nextPath }: ClientLoginPageContentProps) {
  const router = useRouter()
  const { bootstrapStatus, isAuthenticated, signInWithGoogle, reactivateAccount } = useClientAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [inactiveToken, setInactiveToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)

  useEffect(() => {
    if (bootstrapStatus === 'ready' && isAuthenticated) {
      router.replace(nextPath)
    }
  }, [bootstrapStatus, isAuthenticated, nextPath, router])

  async function handleCredential(idToken: string) {
    setIsSubmitting(true)
    setErrorMessage(null)
    setInactiveToken(null)

    try {
      await signInWithGoogle(idToken)
      toast.success('Welcome back to Picsa')
      router.replace(nextPath)
    } catch (error) {
      if (isApiError(error) && error.code === 'AUTH_ACCOUNT_INACTIVE') {
        setInactiveToken(idToken)
        setErrorMessage('Your account is inactive. Reactivate it with the same Google account to continue.')
        return
      }

      setErrorMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Unable to sign in right now',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReactivate() {
    if (!inactiveToken) {
      return
    }

    setIsReactivating(true)

    try {
      await reactivateAccount(inactiveToken)
      toast.success('Your account is active again')
      router.replace(nextPath)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reactivate your account')
    } finally {
      setIsReactivating(false)
    }
  }

  if (bootstrapStatus !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Checking your session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 22% 15%, oklch(0.92 0.05 70 / 0.5), transparent 72%), radial-gradient(ellipse 45% 35% at 86% 18%, oklch(0.86 0.08 35 / 0.22), transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="order-2 space-y-8 lg:order-1">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-serif text-sm font-bold text-accent-foreground">
              P
            </span>
            Back to the landing page
          </Link>

          <div className="max-w-xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Organizer workspace</p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
              Keep the landing-page warmth, now with controls behind it.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Create events, review guest uploads, manage invitations, and keep the entire gallery in one elegant workspace designed around the same photo-led feeling as the homepage.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Event setup', body: 'Spin up an event in minutes with join, privacy, and moderation settings.' },
              { title: 'Gallery flow', body: 'Review images, share highlights, and keep uploads moving without chaos.' },
              { title: 'Guest access', body: 'Approve join requests, invite specific people, and stay in control.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-[0_18px_48px_rgba(35,30,27,0.06)] backdrop-blur">
                <p className="font-serif text-xl font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <div className="relative h-[280px] overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-[0_24px_80px_rgba(35,30,27,0.12)]">
            <Image src="/images/hero-photo-2.jpg" alt="Guests celebrating an event" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div className="max-w-[220px] rounded-[1.25rem] bg-background/80 px-4 py-3 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Today</p>
                <p className="mt-2 font-serif text-2xl font-semibold text-foreground">247 photos collected</p>
              </div>
              <div className="hidden rounded-[1.25rem] bg-background/78 px-4 py-3 backdrop-blur sm:block">
                <p className="text-sm font-medium text-foreground">Guests are already uploading</p>
                <p className="mt-1 text-xs text-muted-foreground">Moderate, approve, and share from one place.</p>
              </div>
            </div>
          </div>

          <Card className="rounded-[2rem] border-border/70 bg-card/92 shadow-[0_24px_80px_rgba(35,30,27,0.10)]">
            <CardHeader className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Google sign-in
              </div>
              <div className="space-y-2">
                <CardTitle className="font-serif text-3xl font-semibold tracking-tight">Enter your Picsa workspace</CardTitle>
                <CardDescription className="text-base leading-7">
                  For now, client access runs through Google. If it is your first time, your account is created automatically.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ClientGoogleSignIn onCredential={handleCredential} disabled={isSubmitting || isReactivating} />

              {errorMessage ? (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertTitle>Sign-in issue</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              {inactiveToken ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border/80 bg-background/60"
                  onClick={() => void handleReactivate()}
                  disabled={isReactivating}
                >
                  <RefreshCcwIcon className="mr-2 h-4 w-4" />
                  {isReactivating ? 'Reactivating...' : 'Reactivate with Google'}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
