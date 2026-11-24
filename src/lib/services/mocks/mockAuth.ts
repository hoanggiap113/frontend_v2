import type { ApiResponse } from '#/lib/types/api'
import type { LoginPayload } from '#/lib/types/auth'

export const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@demo.local',
  password: 'Admin@12345',
} as const

const MOCK_SESSION_KEY = 'cqa_mock_admin_authenticated'

export const mockAuth = {
  login({ email, password }: LoginPayload): ApiResponse<void> {
    if (
      email !== MOCK_ADMIN_CREDENTIALS.email ||
      password !== MOCK_ADMIN_CREDENTIALS.password
    ) {
      return {
        success: false,
        message: 'Email hoặc mật khẩu demo không chính xác.',
      }
    }

    sessionStorage.setItem(MOCK_SESSION_KEY, 'true')
    return { success: true, message: 'Đăng nhập tài khoản demo thành công.' }
  },

  refreshToken(): ApiResponse<void> {
    return { success: sessionStorage.getItem(MOCK_SESSION_KEY) === 'true' }
  },

  logout(): ApiResponse<void> {
    sessionStorage.removeItem(MOCK_SESSION_KEY)
    return { success: true }
  },
}
