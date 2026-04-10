import { useEffect, useRef } from 'react'
import { useClientAuth } from '@/hooks/use-client-auth'

export function ClientAuthBootstrap() {
  const { bootstrap } = useClientAuth()
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    if (bootstrappedRef.current) {
      return
    }

    bootstrappedRef.current = true
    void bootstrap()
  }, [bootstrap])

  return null
}
