'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircleIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon } from '@/components/ui/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { isAdminApiError } from '@/lib/api'
import { MARKETING_APP_URL } from '@/lib/site-urls'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { ClientGoogleSignIn } from '@/components/client/client-google-sign-in'

interface LoginPageContentProps {
  nextPath: string
  googleClientId?: string
}

export function LoginPageContent({ nextPath, googleClientId }: LoginPageContentProps) {
  const router = useRouter()
  const { bootstrapStatus, isAuthenticated, login, loginWithGoogle } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    if (bootstrapStatus === 'ready' && isAuthenticated) {
      router.replace(nextPath)
    }
  }, [bootstrapStatus, isAuthenticated, nextPath, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login({
        email: email.trim(),
        password,
      })
      router.replace(nextPath)
    } catch (error) {
      if (isAdminApiError(error)) {
        setErrorMessage(error.message)
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to sign in right now')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleCredential = async (idToken: string) => {
    setIsGoogleLoading(true)
    setErrorMessage(null)

    try {
      await loginWithGoogle(idToken)
      router.replace(nextPath)
    } catch (error) {
      if (isAdminApiError(error)) {
        setErrorMessage(error.message)
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to sign in right now')
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (bootstrapStatus !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-6">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Checking admin session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.12),_transparent_58%)]" />

      <div className="relative w-full max-w-6xl">
        <div className="mb-6 flex justify-center md:justify-start">
          <Link
            href={MARKETING_APP_URL}
            className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm text-muted-foreground shadow-none backdrop-blur"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              P
            </span>
            Back to picsa.pro
          </Link>
        </div>

        <Card className="overflow-hidden border-border/70 bg-card/95 p-0 shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
          <CardContent className="grid p-0 md:grid-cols-[0.96fr_1.04fr]">
            <form className="p-6 md:p-8 lg:p-10" onSubmit={handleSubmit}>
              <FieldGroup className="gap-6">
                <div className="space-y-4">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    <ShieldCheckIcon className="size-4" />
                    Picsa Admin
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      Welcome back
                    </h1>
                    <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                      Sign in to manage events, moderation, uploads, and live app
                      configuration from the Picsa admin workspace.
                    </p>
                  </div>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>

                {errorMessage ? (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>Sign-in failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <Field>
                  <Button
                    className="h-11 w-full rounded-full"
                    type="submit"
                    disabled={isSubmitting || isGoogleLoading}
                  >
                    {isSubmitting ? <Spinner className="size-4" /> : null}
                    {isSubmitting ? 'Signing in...' : 'Sign in to dashboard'}
                  </Button>
                </Field>

                {googleClientId ? (
                  <>
                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                      Or
                    </FieldSeparator>

                    <Field>
                      <ClientGoogleSignIn
                        clientId={googleClientId}
                        onCredential={handleGoogleCredential}
                        disabled={isSubmitting || isGoogleLoading}
                      />
                    </Field>
                  </>
                ) : null}

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Protected access
                </FieldSeparator>

                <FieldDescription className="text-center text-sm leading-6">
                  This workspace is reserved for authorized Picsa admins only.
                </FieldDescription>
              </FieldGroup>
            </form>

            <div className="relative hidden min-h-[560px] md:block">
              <Image
                src="/images/hero-photo-4.jpg"
                alt="Guests celebrating during a Picsa event"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/76 via-slate-950/40 to-slate-900/22" />
              <div className="absolute inset-x-8 bottom-8 space-y-4 text-white">
                <div className="max-w-sm rounded-[1.75rem] border border-white/15 bg-black/30 p-6 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
                    Live control
                  </p>
                  <p className="mt-3 text-3xl font-semibold leading-tight">
                    Keep every event, upload, and admin action in one place.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: 'Moderation ready',
                      body: 'Review uploads, monitor activity, and step in quickly.',
                    },
                    {
                      title: 'Config at hand',
                      body: 'Update links, limits, and release policy without redeploying.',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.35rem] border border-white/15 bg-black/26 p-4 backdrop-blur-md"
                    >
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/72">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <FieldDescription className="px-4 pt-5 text-center text-xs leading-6 text-muted-foreground md:px-8">
          By continuing, you agree to our{' '}
          <Link
            href={`${MARKETING_APP_URL}/terms-of-service`}
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href={`${MARKETING_APP_URL}/privacy-policy`}
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </Link>
          .
        </FieldDescription>
      </div>
    </div>
  )
}
