import { ApiError } from '#/shared/service/http/client'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
