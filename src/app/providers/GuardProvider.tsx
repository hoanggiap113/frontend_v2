import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { api, setApiBearerToken } from '#/lib/config/api'
import { authService } from '#/lib/services/authService'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean
}

const AUTH_REQUESTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]

let refreshRequest: ReturnType<typeof authService.refreshToken> | null = null

function isAuthRequest(url = '') {
  return AUTH_REQUESTS.some((endpoint) => url.includes(endpoint))
}

function requestNewAccessToken() {
  if (!refreshRequest) {
    refreshRequest = authService.refreshToken().finally(() => {
      refreshRequest = null
    })
  }

  return refreshRequest
}

export default function GuardProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const request = error.config as RetryableRequestConfig | undefined

        if (
          error.response?.status !== 401 ||
          !request ||
          request._authRetry ||
          isAuthRequest(request.url)
        ) {
          return Promise.reject(error)
        }

        request._authRetry = true

        try {
          await requestNewAccessToken()
          return api.request(request)
        } catch (refreshError) {
          // Refresh token đã hết hạn hoặc không còn hợp lệ.
          setApiBearerToken(null)

          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
          ) {
            window.location.replace('/login')
          }

          return Promise.reject(refreshError)
        }
      },
    )

    return () => {
      api.interceptors.response.eject(interceptorId)
    }
  }, [])

  return children
}
