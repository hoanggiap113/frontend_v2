import { isMockMode } from '#/lib/config/env'
import {
  persistKnownUserNames,
  readKnownUserNames,
} from '#/lib/browser-storage'
import { endpoints } from '#/lib/config/endpoints'
import { httpClient } from '#/lib/client'
import { mockDelay } from '#/lib/utils'
import type {
  AuthSession,
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
  permissions: [],
}

function makeSession(email?: string, name?: string): AuthSession {
  return {
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
    const response = await httpClient.post<{
      success: boolean
      message: string
    }>(endpoints.auth.login, payload)

    if (import.meta.env.DEV) {
      console.debug('[auth/login] Response accepted', response)
    }

    const session: AuthSession = {
      user: {
        ...adminUser,
        id: payload.email,
        email: payload.email,
        name: readKnownName(payload.email) || payload.email,
      },
    }
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
  async logout(): Promise<void> {
    if (isMockMode()) {
      await mockDelay(120)
      return
    }
    await httpClient.post<void>(endpoints.auth.logout)
  },
}
