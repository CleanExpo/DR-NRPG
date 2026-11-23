'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  userType: 'CLIENT' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN'
  avatar?: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  sessionError: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (
    email: string,
    password: string,
    name: string,
    userType: 'CLIENT' | 'CONTRACTOR',
    consentAccepted: boolean
  ) => Promise<User>
}

interface RegisterData {
  name: string
  email: string
  password: string
  userType: 'CLIENT' | 'CONTRACTOR'
  consentAccepted: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState(false)

  // Handle session timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === 'loading') {
        console.error('Session initialization timeout: NextAuth failed to initialize after 10 seconds')
        setSessionError(true)
        setLoading(false)
        // Redirect to login with error message
        router.push('/login?error=session_timeout')
      }
    }, 10000) // 10 second timeout

    // Clear timeout if status changes
    if (status !== 'loading') {
      clearTimeout(timeoutId)
      setLoading(false)
      setSessionError(false)
    }

    return () => clearTimeout(timeoutId)
  }, [status, router])

  const user = useMemo<User | null>(() => {
    if (!session?.user) return null

    const sessionUser = session.user as unknown as {
      id?: string
      email?: string | null
      name?: string | null
      userType?: User['userType']
      avatar?: string | null
    }

    if (!sessionUser.id || !sessionUser.email || !sessionUser.userType) return null

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name || '',
      userType: sessionUser.userType,
      avatar: sessionUser.avatar ?? null,
    }
  }, [session])

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (!result || result.error) {
      throw new Error('Invalid email or password')
    }
  }, [])

  const logout = useCallback((): void => {
    void signOut({ redirect: false })
  }, [])

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      userType: 'CLIENT' | 'CONTRACTOR',
      consentAccepted: boolean
    ): Promise<User> => {
      const userData: RegisterData = { email, password, name, userType, consentAccepted }
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        // Show the server's field messages, not only "Validation failed" (DR-1004).
        const fields: unknown[] = Array.isArray(data?.details?.fields) ? data.details.fields : []
        const fieldMessages = fields
          .map((f) => (f && typeof f === 'object' ? (f as { message?: unknown }).message : undefined))
          .filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
        if (fieldMessages.length > 0) {
          throw new Error(fieldMessages.join('. '))
        }
        throw new Error(
          (typeof data?.message === 'string' && data.message) ||
            (typeof data?.error === 'string' && data.error) ||
            'Registration failed'
        )
      }

      if (!data?.success || !data?.data?.user) {
        throw new Error('Invalid response from server')
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (!signInResult || signInResult.error) {
        throw new Error('Account created but sign-in failed')
      }

      const apiUser = data.data.user as User
      return {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        userType: apiUser.userType,
        avatar: apiUser.avatar ?? null,
      }
    },
    []
  )

  const isAuthenticated = useMemo(() => Boolean(user), [user])

  const value = useMemo<AuthContextType>(() => {
    return {
      user,
      isAuthenticated,
      loading,
      sessionError,
      login,
      logout,
      register,
    }
  }, [user, isAuthenticated, loading, sessionError])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
