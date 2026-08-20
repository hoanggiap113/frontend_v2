import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  clearStoredAuthUser,
  persistStoredUser,
  readStoredUser,
  removeStoredUser,
} from '#/lib/browser-storage'
import type { AuthSession, AuthUser } from '#/lib/types/auth'

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
  user: AuthUser | null
}

const initialState: AuthState = {
  user: readUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user
      persistStoredUser(JSON.stringify(action.payload.user))
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      if (action.payload) persistStoredUser(JSON.stringify(action.payload))
      else removeStoredUser()
    },
    clearSession(state) {
      state.user = null
      clearStoredAuthUser()
    },
  },
})

export const { setSession, setUser, clearSession } = authSlice.actions
export default authSlice.reducer
