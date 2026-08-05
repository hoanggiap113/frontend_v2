import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  clearAuthStorage,
  persistAuthTokens,
  persistStoredUser,
  readAccessToken,
  readStoredUser,
  removeStoredUser,
} from '#/shared/lib/browser-storage'
import type { AuthSession, AuthUser } from '../types/auth'

function readToken() {
  return readAccessToken()
}

function readUser(): AuthUser | null {
  const raw = readStoredUser()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthUser & { isAdmin?: boolean }
    if (!parsed.role && typeof parsed.isAdmin === 'boolean') {
      const { isAdmin, ...user } = parsed
      const migratedUser: AuthUser = {
        ...user,
        role: isAdmin ? 'ADMIN' : 'MEMBER',
      }
      persistStoredUser(JSON.stringify(migratedUser))
      return migratedUser
    }
    return parsed
  } catch {
    return null
  }
}

interface AuthState {
  accessToken: string
  refreshToken: string
  user: AuthUser | null
}

const initialState: AuthState = {
  accessToken: readToken(),
  refreshToken: '',
  user: readUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken ?? ''
      state.user = action.payload.user
      persistAuthTokens(action.payload)
      persistStoredUser(JSON.stringify(action.payload.user))
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      if (action.payload) persistStoredUser(JSON.stringify(action.payload))
      else removeStoredUser()
    },
    clearSession(state) {
      state.accessToken = ''
      state.refreshToken = ''
      state.user = null
      clearAuthStorage()
    },
  },
})

export const { setSession, setUser, clearSession } = authSlice.actions
export default authSlice.reducer
