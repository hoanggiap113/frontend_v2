import axios from 'axios'
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { appConfig } from '#/lib/config/env'
import { clearStoredAuthUser } from '#/lib/browser-storage'
import { endpoints } from '#/lib/config/endpoints'
import type { ApiResponse } from '#/lib/types/api'

export class ApiError extends Error {
  status: number
  code?: string
  data: unknown
  metadata: unknown

  constructor({
    status,
    message,
    code,
    data,
    metadata,
  }: {
    status: number
    message: string
    code?: string
    data: unknown
    metadata?: unknown
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
    this.metadata = metadata
  }
}

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshRequest: Promise<void> | null = null

function refreshSession() {
  if (!refreshRequest) {
    const refreshUrl = `${appConfig.apiBaseUrl.replace(/\/$/, '')}${endpoints.auth.refresh}`
    refreshRequest = axios
      .post(refreshUrl, undefined, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

function isAuthRequest(url = '') {
  return [
    endpoints.auth.login,
    endpoints.auth.register,
    endpoints.auth.refresh,
    endpoints.auth.logout,
  ].some((endpoint) => url.includes(endpoint))
}

function logHttpFailure(error: AxiosError) {
  if (!import.meta.env.DEV) return

  console.error('[http] Request failed', {
    baseURL: error.config?.baseURL,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    status: error.response?.status ?? 0,
    message: error.message,
    response: error.response?.data,
    hasResponse: Boolean(error.response),
  })
}

api.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      const apiBody = body as ApiResponse<unknown>
      if (apiBody.success === false) {
        throw parseApiError(response.status, body)
      }
      return apiBody.data !== undefined ? apiBody.data : body
    }
    return body
  },
  async (error: AxiosError) => {
    logHttpFailure(error)

    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status ?? 0

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true

      try {
        await refreshSession()
        return api(originalRequest)
      } catch (refreshError) {
        if (import.meta.env.DEV) {
          console.error('[auth/refresh] Cookie refresh failed', refreshError)
        }
        clearStoredAuthUser()
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login'
        ) {
          window.location.assign('/login')
        }
      }
    }

    throw parseApiError(status, error.response?.data, error.message)
  },
)

function parseApiError(
  status: number,
  body: unknown,
  fallbackMessage?: string,
): ApiError {
  const data = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    any
  >

  const message =
    data.error?.message ||
    data.message ||
    (typeof data.error === 'string' ? data.error : undefined) ||
    fallbackMessage ||
    `HTTP ${status}`

  const code = data.error?.code || data.code
  const metadata = data.metadata || data.error?.metadata

  return new ApiError({
    status,
    message,
    code,
    data: body,
    metadata,
  })
}

export interface RequestConfig extends AxiosRequestConfig {
  query?: Record<string, string | number | boolean | undefined>
}

export type RequestOptions = RequestConfig

export const httpClient = {
  get: <T>(url: string, config?: RequestConfig) =>
    api.get<unknown, T>(url, {
      ...config,
      params: config?.query ?? config?.params,
    }),

  post: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    api.post<unknown, T>(url, body, {
      ...config,
      params: config?.query ?? config?.params,
    }),

  put: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    api.put<unknown, T>(url, body, {
      ...config,
      params: config?.query ?? config?.params,
    }),

  delete: <T>(url: string, config?: RequestConfig) =>
    api.delete<unknown, T>(url, {
      ...config,
      params: config?.query ?? config?.params,
    }),
}
