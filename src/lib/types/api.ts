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
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
