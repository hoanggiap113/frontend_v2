import { apiRequest } from '#/lib/config/api'
import type { ApiResponse } from '#/lib/types/api'
import type {
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from '#/lib/types/auth'
import { isMockMode } from '#/lib/config/env'
import { mockAuth } from './mocks/mockAuth'

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  refreshToken: '/auth/refresh',
  logout: '/auth/logout',
} as const

let refreshRequest: Promise<ApiResponse<void>> | null = null

export const authService = {
  login(payload: LoginPayload) {
    if (isMockMode()) return Promise.resolve(mockAuth.login(payload))

    return apiRequest<ApiResponse<void>, LoginPayload>({
      method: 'POST',
      url: AUTH_ENDPOINTS.login,
      body: payload,
    })
  },

  register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> {
    if (isMockMode()) {
      return Promise.resolve({
        success: false,
        message: 'Đăng ký chưa được bật trong chế độ mock.',
      } satisfies ApiResponse<RegisterResponse>)
    }

    return apiRequest<ApiResponse<RegisterResponse>, RegisterPayload>({
      method: 'POST',
      url: AUTH_ENDPOINTS.register,
      body: payload,
    })
  },

  refreshToken() {
    if (isMockMode()) return Promise.resolve(mockAuth.refreshToken())

    refreshRequest ??= apiRequest<ApiResponse<void>>({
      method: 'POST',
      url: AUTH_ENDPOINTS.refreshToken,
    }).finally(() => {
      refreshRequest = null
    })
    return refreshRequest
  },

  logout() {
    if (isMockMode()) return Promise.resolve(mockAuth.logout())

    return apiRequest<ApiResponse<void>>({
      method: 'POST',
      url: AUTH_ENDPOINTS.logout,
    })
  },
}
