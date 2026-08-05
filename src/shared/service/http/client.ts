import { appConfig } from '#/shared/config/env'
import {
  persistAuthTokens,
  readAccessToken,
  readRefreshToken,
} from '#/shared/lib/browser-storage'
import { endpoints } from '#/shared/service/endpoints'
import type { ApiResponse } from '#/shared/types/api'
import type { AuthTokenResponse } from '#/shared/types/auth-token'

export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const isAbsolutePath = /^https?:/i.test(path)
  const baseUrl = appConfig.apiBaseUrl?.replace(/\/$/, '')
  const endpoint = path.replace(/^\//, '')
  const url = isAbsolutePath
    ? new URL(path)
    : baseUrl
      ? new URL(
          `${baseUrl}/${endpoint}`,
          /^https?:/i.test(baseUrl) ? undefined : window.location.origin,
        )
      : new URL(path, window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    headers,
  })

  if (response.status === 401 && path !== endpoints.auth.refresh) {
    const latestToken = getAccessToken()
    if (latestToken && latestToken !== token) {
      const retryHeaders = new Headers(options.headers)
      retryHeaders.set('Content-Type', 'application/json')
      retryHeaders.set('Authorization', `Bearer ${latestToken}`)
      const retryResponse = await fetch(buildUrl(path, options.query), {
        ...options,
        headers: retryHeaders,
      })
      return parseResponse<T>(retryResponse)
    }

    const session = await refreshSession()
    if (session) {
      const retryHeaders = new Headers(options.headers)
      retryHeaders.set('Content-Type', 'application/json')
      retryHeaders.set('Authorization', `Bearer ${session.accessToken}`)
      const retryResponse = await fetch(buildUrl(path, options.query), {
        ...options,
        headers: retryHeaders,
      })
      return parseResponse<T>(retryResponse)
    }
  }

  return parseResponse<T>(response)
}

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

function getAccessToken() {
  return readAccessToken()
}

function getRefreshToken() {
  return readRefreshToken()
}

function persistTokens(tokens: AuthTokenResponse) {
  persistAuthTokens(tokens)
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => undefined)

  if (!response.ok) {
    throw createApiError(response.status, body)
  }

  if (body && typeof body === 'object' && 'success' in body) {
    const apiBody = body as ApiResponse<T>

    if (apiBody.success === false) {
      throw createApiError(response.status, apiBody)
    }

    return apiBody.data as T
  }

  return body as T
}

function createApiError(status: number, body: unknown): ApiError {
  const apiBody = isApiResponse(body) ? body : undefined
  const plainError = getPlainErrorDetails(body)
  const message =
    apiBody?.error?.message ||
    apiBody?.message ||
    plainError.message ||
    `HTTP ${status}`

  return new ApiError({
    status,
    message,
    code: apiBody?.error?.code || plainError.code,
    data: body,
    metadata: apiBody?.metadata ?? plainError.metadata,
  })
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return Boolean(value && typeof value === 'object' && 'success' in value)
}

function getPlainErrorDetails(value: unknown): {
  code?: string
  message?: string
  metadata?: unknown
} {
  if (!value || typeof value !== 'object') return {}

  const details: { code?: string; message?: string; metadata?: unknown } = {}

  if ('message' in value && typeof value.message === 'string') {
    details.message = value.message
  }
  if ('metadata' in value) {
    details.metadata = value.metadata
  }
  if ('error' in value && typeof value.error === 'string') {
    details.message = value.error
  }
  if ('error' in value && value.error && typeof value.error === 'object') {
    if ('message' in value.error && typeof value.error.message === 'string') {
      details.message = value.error.message
    }
    if ('code' in value.error && typeof value.error.code === 'string') {
      details.code = value.error.code
    }
  }

  return details
}

async function refreshSession(): Promise<AuthTokenResponse | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(buildUrl(endpoints.auth.refresh), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const tokens = await parseResponse<AuthTokenResponse>(response)
    persistTokens(tokens)
    return tokens
  } catch {
    return null
  }
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
