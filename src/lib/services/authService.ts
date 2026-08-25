import { apiRequest } from '#/lib/config/api'
import type { ApiResponse } from '#/lib/types/api'
import type {
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from '#/lib/types/auth'

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  refreshToken: '/auth/refresh',
  logout: '/auth/logout',
} as const

export const authService = {
  login(payload: LoginPayload) {
    return apiRequest<ApiResponse<void>, LoginPayload>({
      method: 'POST',
      url: AUTH_ENDPOINTS.login,
      body: payload,
    })
  },

  register(payload: RegisterPayload) {
    return apiRequest<ApiResponse<RegisterResponse>, RegisterPayload>({
      method: 'POST',
      url: AUTH_ENDPOINTS.register,
      body: payload,
    })
  },

  refreshToken() {
    return apiRequest<ApiResponse<void>>({
      method: 'POST',
      url: AUTH_ENDPOINTS.refreshToken,
    })
  },

  logout() {
    return apiRequest<ApiResponse<void>>({
      method: 'POST',
      url: AUTH_ENDPOINTS.logout,
    })
  },
}
