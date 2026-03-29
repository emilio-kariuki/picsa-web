'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon, SmartphoneIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const APP_OPEN_DELAY_MS = 120
const BROWSER_FALLBACK_DELAY_MS = 1400

function isProbablyMobileUserAgent(userAgent?: string | null) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent ?? '')
}

interface MobileAppHandoffProps {
  deepLinkHref: string
  title: string
  description: string
  className?: string
  variant?: 'inline' | 'overlay'
}

export function MobileAppHandoff({
  deepLinkHref,
  title,
  description,
  className,
  variant = 'inline',
}: MobileAppHandoffProps) {
  const [shouldAttemptHandoff, setShouldAttemptHandoff] = useState(false)
  const [showBrowserFallback, setShowBrowserFallback] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const hasAttemptedOpenRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setShouldAttemptHandoff(
      isProbablyMobileUserAgent(window.navigator.userAgent),
    )
  }, [])

  useEffect(() => {
    if (!shouldAttemptHandoff || dismissed || hasAttemptedOpenRef.current) {
      return
    }

    hasAttemptedOpenRef.current = true

    const openTimer = window.setTimeout(() => {
      window.location.assign(deepLinkHref)
    }, APP_OPEN_DELAY_MS)
    const fallbackTimer = window.setTimeout(() => {
      setShowBrowserFallback(true)
    }, BROWSER_FALLBACK_DELAY_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') {
        return
      }

      window.clearTimeout(fallbackTimer)
      setDismissed(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(fallbackTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [deepLinkHref, dismissed, shouldAttemptHandoff])

  if (!shouldAttemptHandoff || dismissed) {
    return null
  }

  const content = (
    <div
      className={cn(
        'w-full max-w-md rounded-[1.5rem] border border-border/70 bg-background/94 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur',
        variant === 'overlay' && 'mx-auto',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          {showBrowserFallback ? (
            <SmartphoneIcon className="h-6 w-6" />
          ) : (
            <Spinner className="size-5" />
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <a href={deepLinkHref}>
                Open Picsa now
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>

            {showBrowserFallback ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-border/80 bg-background/70"
                onClick={() => {
                  setDismissed(true)
                }}
              >
                Continue in browser
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 px-6 py-10 backdrop-blur-md">
        {content}
      </div>
    )
  }

  return content
}
