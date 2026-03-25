'use client'

import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { ApiError } from '@/lib/api'
import {
  buildClientAuthSession,
  isActiveClientUser,
  readStoredClientAuthSession,
  type ClientAuthSession,
} from '@/lib/client-auth'
import {
  fetchAuthenticatedClient,
  loginWithGoogle,
  logoutClientSession,
  reactivateWithGoogle,
  refreshClientSession,
} from '@/lib/client-auth-api'
import {
  clientAuthBootstrapStatusAtom,
  clientAuthSessionAtom,
  clientCurrentUserAtom,
  isClientAuthenticatedAtom,
} from '@/lib/store'

export function useClientAuth() {
  const [session, setSession] = useAtom(clientAuthSessionAtom)
  const [bootstrapStatus, setBootstrapStatus] = useAtom(clientAuthBootstrapStatusAtom)
  const currentUser = useAtomValue(clientCurrentUserAtom)
  const isAuthenticated = useAtomValue(isClientAuthenticatedAtom)

  const clearSession = useCallback(() => {
    setSession(null)
  }, [setSession])

  const hydrateSession = useCallback(
    (nextSession: ClientAuthSession | null) => {
      setSession(nextSession)
      return nextSession
    },
    [setSession],
  )

  const bootstrap = useCallback(async () => {
    setBootstrapStatus('loading')

    const storedSession = readStoredClientAuthSession()

    if (!storedSession?.accessToken || !storedSession.refreshToken) {
      hydrateSession(null)
      setBootstrapStatus('ready')
      return null
    }

    hydrateSession(storedSession)

    try {
      const meResponse = await fetchAuthenticatedClient(storedSession.accessToken)

      if (!isActiveClientUser(meResponse.data.user)) {
        hydrateSession(null)
        setBootstrapStatus('ready')
        return null
      }

      const hydratedSession = hydrateSession({
        ...storedSession,
        currentUser: meResponse.data.user,
      })
      setBootstrapStatus('ready')
      return hydratedSession
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        hydrateSession(null)
        setBootstrapStatus('ready')
        return null
      }
    }

    try {
      const refreshResponse = await refreshClientSession(storedSession.refreshToken)

      if (!isActiveClientUser(refreshResponse.data.user)) {
        try {
          await logoutClientSession(refreshResponse.data.refreshToken)
        } catch {}

        hydrateSession(null)
        setBootstrapStatus('ready')
        return null
      }

      const refreshedSession = buildClientAuthSession(refreshResponse.data)
      const meResponse = await fetchAuthenticatedClient(refreshedSession.accessToken)

      if (!isActiveClientUser(meResponse.data.user)) {
        try {
          await logoutClientSession(refreshedSession.refreshToken)
        } catch {}

        hydrateSession(null)
        setBootstrapStatus('ready')
        return null
      }

      const hydratedSession = hydrateSession({
        ...refreshedSession,
        currentUser: meResponse.data.user,
      })
      setBootstrapStatus('ready')
      return hydratedSession
    } catch {
      hydrateSession(null)
      setBootstrapStatus('ready')
      return null
    }
  }, [hydrateSession, setBootstrapStatus])

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const response = await loginWithGoogle({ idToken })
      const nextSession = buildClientAuthSession(response.data)

      if (!isActiveClientUser(nextSession.currentUser)) {
        try {
          await logoutClientSession(nextSession.refreshToken)
        } catch {}

        hydrateSession(null)
        throw new ApiError('Active account required', {
          status: 403,
        })
      }

      hydrateSession(nextSession)
      setBootstrapStatus('ready')
      return nextSession
    },
    [hydrateSession, setBootstrapStatus],
  )

  const reactivateAccount = useCallback(
    async (idToken: string) => {
      const response = await reactivateWithGoogle({ idToken })
      const nextSession = buildClientAuthSession(response.data)

      if (!isActiveClientUser(nextSession.currentUser)) {
        hydrateSession(null)
        throw new ApiError('Unable to reactivate account', {
          status: 403,
        })
      }

      hydrateSession(nextSession)
      setBootstrapStatus('ready')
      return nextSession
    },
    [hydrateSession, setBootstrapStatus],
  )

  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken

    try {
      if (refreshToken) {
        await logoutClientSession(refreshToken)
      }
    } catch {
    } finally {
      hydrateSession(null)
      setBootstrapStatus('ready')
    }
  }, [hydrateSession, session?.refreshToken, setBootstrapStatus])

  const performAuthenticatedRequest = useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>) => {
      const activeSession = session ?? readStoredClientAuthSession()

      if (!activeSession?.accessToken || !activeSession.refreshToken) {
        hydrateSession(null)
        setBootstrapStatus('ready')
        throw new ApiError('Authentication required', {
          status: 401,
        })
      }

      if (!session) {
        hydrateSession(activeSession)
      }

      try {
        return await request(activeSession.accessToken)
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error
        }
      }

      try {
        const refreshResponse = await refreshClientSession(activeSession.refreshToken)

        if (!isActiveClientUser(refreshResponse.data.user)) {
          try {
            await logoutClientSession(refreshResponse.data.refreshToken)
          } catch {}

          hydrateSession(null)
          setBootstrapStatus('ready')
          throw new ApiError('Active account required', {
            status: 403,
          })
        }

        const refreshedSession = buildClientAuthSession(refreshResponse.data)
        const meResponse = await fetchAuthenticatedClient(refreshedSession.accessToken)

        if (!isActiveClientUser(meResponse.data.user)) {
          try {
            await logoutClientSession(refreshedSession.refreshToken)
          } catch {}

          hydrateSession(null)
          setBootstrapStatus('ready')
          throw new ApiError('Active account required', {
            status: 403,
          })
        }

        const nextSession = {
          ...refreshedSession,
          currentUser: meResponse.data.user,
        }

        hydrateSession(nextSession)
        setBootstrapStatus('ready')

        return await request(nextSession.accessToken)
      } catch (error) {
        hydrateSession(null)
        setBootstrapStatus('ready')

        if (error instanceof ApiError) {
          throw error
        }

        throw new ApiError('Authentication required', {
          status: 401,
        })
      }
    },
    [hydrateSession, session, setBootstrapStatus],
  )

  return {
    session,
    currentUser,
    isAuthenticated,
    bootstrapStatus,
    bootstrap,
    signInWithGoogle,
    reactivateAccount,
    logout,
    clearSession,
    performAuthenticatedRequest,
  }
}
