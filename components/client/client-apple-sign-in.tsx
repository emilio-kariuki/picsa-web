'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    AppleID?: {
      auth?: {
        init: (config: {
          clientId: string
          redirectURI: string
          scope?: string
          usePopup?: boolean
        }) => void
        signIn: () => Promise<{
          authorization?: {
            id_token?: string
          }
          user?: {
            name?: {
              firstName?: string
              lastName?: string
            }
          }
        }>
      }
    }
  }
}

export function ClientAppleSignIn({
  clientId,
  onCredential,
  disabled,
}: {
  clientId: string
  onCredential: (payload: { idToken: string; name?: string | null }) => void
  disabled?: boolean
}) {
  const [scriptReady, setScriptReady] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!scriptReady || !clientId || sdkReady || !window.AppleID?.auth) {
      return
    }

    try {
      window.AppleID.auth.init({
        clientId,
        redirectURI: `${window.location.origin}${window.location.pathname}`,
        scope: 'name email',
        usePopup: true,
      })
      setSdkReady(true)
      setErrorMessage(null)
    } catch {
      setErrorMessage('Apple sign-in is not available right now.')
    }
  }, [clientId, scriptReady, sdkReady])

  async function handleAppleSignIn() {
    if (!window.AppleID?.auth || disabled) {
      return
    }

    setErrorMessage(null)

    try {
      const response = await window.AppleID.auth.signIn()
      const idToken = response.authorization?.id_token?.trim()

      if (!idToken) {
        throw new Error('Missing Apple identity token')
      }

      const nameParts = [
        response.user?.name?.firstName?.trim(),
        response.user?.name?.lastName?.trim(),
      ].filter(Boolean)

      onCredential({
        idToken,
        name: nameParts.length ? nameParts.join(' ') : null,
      })
    } catch (error) {
      const errorCode =
        error &&
        typeof error === 'object' &&
        'error' in error &&
        typeof error.error === 'string'
          ? error.error
          : null

      if (errorCode === 'popup_closed_by_user' || errorCode === 'user_cancelled_authorize') {
        return
      }

      setErrorMessage('Unable to continue with Apple right now.')
    }
  }

  if (!clientId) {
    return null
  }

  return (
    <div className="space-y-3">
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setErrorMessage('Unable to load Apple sign-in right now.')}
      />

      <Button
        type="button"
        className="h-12 w-full rounded-full bg-[#111111] text-white hover:bg-black"
        disabled={!sdkReady || disabled}
        onClick={() => void handleAppleSignIn()}
      >
        Continue with Apple
      </Button>

      {errorMessage ? (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Apple sign-in issue</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
