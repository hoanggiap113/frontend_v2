export type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
  error?: {
    code?: string
    message?: string
  }
  metadata?: unknown
  timestamp?: number
}

export interface PageResponse<T> {
  page: number
  total: number
  pageSize: number
  limit: number
  data: T[]
}
