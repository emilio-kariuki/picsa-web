'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
            auto_select?: boolean
            use_fedcm_for_prompt?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            config: Record<string, string | number | boolean>,
          ) => void
          cancel: () => void
        }
      }
    }
  }
}

export function ClientGoogleSignIn({
  clientId,
  onCredential,
  disabled,
}: {
  clientId: string
  onCredential: (token: string) => void
  disabled?: boolean
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [buttonRendered, setButtonRendered] = useState(false)

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || buttonRendered || !window.google?.accounts?.id) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const token = response.credential?.trim()

        if (!token || disabled) {
          return
        }

        onCredential(token)
      },
      auto_select: false,
      use_fedcm_for_prompt: true,
    })

    buttonRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      text: 'continue_with',
      shape: 'pill',
      size: 'large',
      width: Math.max(buttonRef.current.clientWidth, 280),
      logo_alignment: 'left',
    })
    setButtonRendered(true)

    return () => {
      window.google?.accounts?.id?.cancel?.()
    }
  }, [buttonRendered, clientId, disabled, onCredential, scriptReady])

  if (!clientId) {
    return (
      <Alert variant="destructive" className="rounded-2xl">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Google sign-in is not configured</AlertTitle>
        <AlertDescription>
          Set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> for the web app to enable client login.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className="w-full min-h-11" aria-disabled={disabled} />
    </>
  )
}
