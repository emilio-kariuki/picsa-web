'use client'

import { useEffect, useRef } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'

export function AdminAuthBootstrap() {
  const { bootstrap } = useAdminAuth()
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
