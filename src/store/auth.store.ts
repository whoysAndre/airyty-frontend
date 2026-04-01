'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth.types'
import { setCookie, deleteCookie } from '@/lib/cookies'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        setCookie('auth-token', token, 7)
        setCookie('auth-role', user.role, 7)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        deleteCookie('auth-token')
        deleteCookie('auth-role')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-sync cookie on page reload from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.token) setCookie('auth-token', state.token, 7)
        if (state?.user?.role) setCookie('auth-role', state.user.role, 7)
      },
    },
  ),
)
