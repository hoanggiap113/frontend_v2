import { isMockMode } from '#/shared/config/env'
import {
  persistAuthTokens,
  persistKnownUserNames,
  persistStoredUser,
  readKnownUserNames,
} from '#/shared/lib/browser-storage'
import { endpoints } from '#/shared/service/endpoints'
import { httpClient } from '#/shared/service/http/client'
import { mockDelay } from '#/shared/service/utils'
import type {
  AuthSession,
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  SetupPayload,
  VerifyEmailResponse,
} from '../types/auth'

const adminUser: AuthUser = {
  id: 'u_admin',
  email: 'admin@gmail.com',
  name: 'Admin',
  role: 'ADMIN',
  permissions: [
    'channels:rw',
    'messages:rw',
    'jobs:rw',
    'users:rw',
    'settings:rw',
  ],
}

function makeSession(email?: string, name?: string): AuthSession {
  return {
    accessToken: `mock-token-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    user: {
      ...adminUser,
      email: email ?? adminUser.email,
      name: name ?? adminUser.name,
    },
  }
}

function readKnownName(email: string) {
  const raw = readKnownUserNames()
  if (!raw) return undefined

  try {
    const names = JSON.parse(raw) as Record<string, string>
    return names[email]
  } catch {
    return undefined
  }
}

function saveKnownName(email: string, name: string) {
  if (!name.trim()) return

  const raw = readKnownUserNames()
  let names: Record<string, string> = {}
  try {
    names = raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    names = {}
  }

  names[email] = name.trim()
  persistKnownUserNames(JSON.stringify(names))
}

function makeSessionFromTokens(
  tokens: AuthTokenResponse,
  email: string,
  name?: string,
): AuthSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      ...adminUser,
      id: email,
      email,
      name: name || readKnownName(email) || email,
    },
  }
}

function persistSession(session: AuthSession) {
  persistAuthTokens(session)
  persistStoredUser(JSON.stringify(session.user))
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (isMockMode()) {
      await mockDelay(320)
      const isDemoAdminLogin =
        payload.email === 'admin@gmail.com' && payload.password === '123'
      if (!isDemoAdminLogin) {
        throw new Error('Invalid credentials')
      }
      return makeSession('admin@gmail.com', 'Admin')
    }
    const tokens = await httpClient.post<AuthTokenResponse>(
      endpoints.auth.login,
      payload,
    )
    const session = makeSessionFromTokens(tokens, payload.email)
    persistSession(session)
    return session
  },
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    if (isMockMode()) {
      await mockDelay(320)
      saveKnownName(payload.email, payload.name)
      return {
        message: 'Register successfully. Verify your email.',
        email: payload.email,
        status: 'PENDING',
      }
    }
    const response = await httpClient.post<RegisterResponse>(
      endpoints.auth.register,
      payload,
    )
    saveKnownName(payload.email, payload.name)
    return response
  },
  async verifyEmail(email: string, otp: string): Promise<VerifyEmailResponse> {
    if (isMockMode()) {
      await mockDelay(320)
      if (otp !== '123456') {
        throw new Error('Invalid OTP')
      }
      return { message: 'Email verified successfully', status: 'ACTIVE' }
    }
    return httpClient.post<VerifyEmailResponse>(endpoints.auth.verifyEmail, {
      email,
      otp,
    })
  },
  async resendOtp(email: string): Promise<{ message: string }> {
    if (isMockMode()) {
      await mockDelay(200)
      return { message: 'OTP sent successfully' }
    }
    return httpClient.post(endpoints.auth.resendOtp, { email })
  },
  async setup(payload: SetupPayload): Promise<AuthSession> {
    await mockDelay(120)
    if (isMockMode()) return makeSession(payload.email, payload.name)
    throw new Error('Tính năng thiết lập tài khoản ban đầu chưa khả dụng.')
  },
  async profile(): Promise<AuthUser> {
    await mockDelay(120)
    return adminUser
  },
  async logout(refreshToken: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay(120)
      return
    }
    await httpClient.post<void>(endpoints.auth.logout, { refreshToken })
  },
}
