'use client'

import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { AdminApiError } from '@/lib/api'
import {
  buildAdminAuthSession,
  isAdminUser,
  readStoredAdminAuthSession,
  type AdminAuthSession,
} from '@/lib/auth'
import {
  fetchAuthenticatedAdmin,
  loginAdminWithGoogle,
  loginWithPassword,
  logoutAdminSession,
  refreshAdminSession,
  type PasswordLoginInput,
} from '@/lib/auth-api'
import {
  adminAuthBootstrapStatusAtom,
  adminAuthSessionAtom,
  currentUserAtom,
  isAuthenticatedAtom,
} from '@/lib/store'

export function useAdminAuth() {
  const [session, setSession] = useAtom(adminAuthSessionAtom)
  const [bootstrapStatus, setBootstrapStatus] = useAtom(adminAuthBootstrapStatusAtom)
  const currentUser = useAtomValue(currentUserAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  const clearSession = useCallback(() => {
    setSession(null)
  }, [setSession])

  const hydrateSession = useCallback(
    (nextSession: AdminAuthSession | null) => {
      setSession(nextSession)
      return nextSession
    },
    [setSession],
  )

  const bootstrap = useCallback(async () => {
    setBootstrapStatus('loading')

    const storedSession = readStoredAdminAuthSession()

    if (!storedSession?.accessToken || !storedSession.refreshToken) {
      hydrateSession(null)
      setBootstrapStatus('ready')
      return null
    }

    hydrateSession(storedSession)

    try {
      const meResponse = await fetchAuthenticatedAdmin(storedSession.accessToken)

      if (!isAdminUser(meResponse.data.user)) {
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
      if (!(error instanceof AdminApiError) || error.status !== 401) {
        hydrateSession(null)
        setBootstrapStatus('ready')
        return null
      }
    }

    try {
      const refreshResponse = await refreshAdminSession(storedSession.refreshToken)

      if (!isAdminUser(refreshResponse.data.user)) {
        try {
          await logoutAdminSession(refreshResponse.data.refreshToken)
        } catch {}

        hydrateSession(null)
        setBootstrapStatus('ready')
        return null
      }

      const refreshedSession = buildAdminAuthSession(refreshResponse.data)
      const meResponse = await fetchAuthenticatedAdmin(refreshedSession.accessToken)

      if (!isAdminUser(meResponse.data.user)) {
        try {
          await logoutAdminSession(refreshedSession.refreshToken)
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

  const login = useCallback(
    async (input: PasswordLoginInput) => {
      const response = await loginWithPassword(input)
      const nextSession = buildAdminAuthSession(response.data)

      if (!isAdminUser(nextSession.currentUser)) {
        try {
          await logoutAdminSession(nextSession.refreshToken)
        } catch {}

        hydrateSession(null)
        throw new AdminApiError('Admin access required', {
          status: 403,
        })
      }

      hydrateSession(nextSession)
      setBootstrapStatus('ready')
      return nextSession
    },
    [hydrateSession, setBootstrapStatus],
  )

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const response = await loginAdminWithGoogle({ idToken })
      const nextSession = buildAdminAuthSession(response.data)

      if (!isAdminUser(nextSession.currentUser)) {
        try {
          await logoutAdminSession(nextSession.refreshToken)
        } catch {}

        hydrateSession(null)
        throw new AdminApiError('Admin access required', {
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
        await logoutAdminSession(refreshToken)
      }
    } catch {
    } finally {
      hydrateSession(null)
      setBootstrapStatus('ready')
    }
  }, [hydrateSession, session?.refreshToken, setBootstrapStatus])

  const performAuthenticatedRequest = useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>) => {
      const activeSession = session ?? readStoredAdminAuthSession()

      if (!activeSession?.accessToken || !activeSession.refreshToken) {
        hydrateSession(null)
        setBootstrapStatus('ready')
        throw new AdminApiError('Authentication required', {
          status: 401,
        })
      }

      if (!session) {
        hydrateSession(activeSession)
      }

      try {
        return await request(activeSession.accessToken)
      } catch (error) {
        if (!(error instanceof AdminApiError) || error.status !== 401) {
          throw error
        }
      }

      try {
        const refreshResponse = await refreshAdminSession(activeSession.refreshToken)

        if (!isAdminUser(refreshResponse.data.user)) {
          try {
            await logoutAdminSession(refreshResponse.data.refreshToken)
          } catch {}

          hydrateSession(null)
          setBootstrapStatus('ready')
          throw new AdminApiError('Admin access required', {
            status: 403,
          })
        }

        const refreshedSession = buildAdminAuthSession(refreshResponse.data)
        const meResponse = await fetchAuthenticatedAdmin(refreshedSession.accessToken)

        if (!isAdminUser(meResponse.data.user)) {
          try {
            await logoutAdminSession(refreshedSession.refreshToken)
          } catch {}

          hydrateSession(null)
          setBootstrapStatus('ready')
          throw new AdminApiError('Admin access required', {
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

        if (error instanceof AdminApiError) {
          throw error
        }

        throw new AdminApiError('Authentication required', {
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
    login,
    loginWithGoogle,
    logout,
    clearSession,
    performAuthenticatedRequest,
  }
}
