export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  email: string
  name: string
  password: string
}

export type { AuthTokenResponse } from '#/shared/types/auth-token'

export interface RegisterResponse {
  message: string
  email: string
  status: string
}

export interface VerifyEmailResponse {
  message: string
  status: string
}

export interface SetupPayload {
  email: string
  name: string
  password: string
}

export interface AuthSession {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}
