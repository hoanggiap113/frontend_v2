import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { appConfig } from './env'

export type ApiQuery = Record<string, unknown>

export interface ApiRequestConfig<
  TBody = unknown,
  TQuery extends ApiQuery = ApiQuery,
> extends Omit<AxiosRequestConfig<TBody>, 'data' | 'params'> {
  body?: TBody
  query?: TQuery
}

let bearerToken = ''

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,

  // Config header
  headers: {
    Accept: 'application/json',
  },

  // Config query string
  paramsSerializer: {
    indexes: null,
  },
})

// Config bearer token
export function setApiBearerToken(token?: string | null) {
  bearerToken = token?.trim() ?? ''
}

api.interceptors.request.use((config) => {
  if (bearerToken) {
    config.headers.set('Authorization', `Bearer ${bearerToken}`)
  }

  // Config body
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  } else if (config.data !== undefined && !config.headers.has('Content-Type')) {
    config.headers.set('Content-Type', 'application/json')
  }

  return config
})

// Config body và query string cho từng request
export async function apiRequest<
  TResponse,
  TBody = unknown,
  TQuery extends ApiQuery = ApiQuery,
>({ body, query, ...config }: ApiRequestConfig<TBody, TQuery>) {
  const response = await api.request<TResponse>({
    ...config,
    data: body,
    params: query,
  })

  return response.data
}
