import { getApiErrorMessage } from '#/shared/lib/api-error-helper'
import { ApiError } from '#/shared/service/http/client'

const JOB_ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN: 'Bạn không có quyền thao tác với tác vụ AI trong workspace này.',
  INSUFFICIENT_PERMISSIONS:
    'Chỉ Owner hoặc Admin mới có quyền thực hiện thao tác này.',
  INTERNAL_ERROR:
    'Hệ thống đang gặp lỗi khi xử lý tác vụ AI. Vui lòng thử lại sau.',
  NOT_FOUND: 'Không tìm thấy tác vụ AI này hoặc tác vụ đã bị xóa.',
  TENANT_NOT_FOUND: 'Không tìm thấy workspace hiện tại.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin người dùng hiện tại.',
}

export function getJobErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return getApiErrorMessage(error, fallback)
  }

  const normalizedMessage = error.message.toLowerCase()

  if (error.code === 'VALIDATION_ERROR') {
    if (normalizedMessage.includes('already running')) {
      return 'Tác vụ AI này đang chạy. Vui lòng đợi lần chạy hiện tại kết thúc rồi thử lại.'
    }

    if (normalizedMessage.includes('not active')) {
      return 'Tác vụ AI đang tắt nên không thể chạy thử. Hãy bật tác vụ trước khi chạy.'
    }

    if (normalizedMessage.includes('name must not exceed')) {
      return 'Tên tác vụ AI không được vượt quá 255 ký tự.'
    }

    return error.message || fallback
  }

  return JOB_ERROR_MESSAGES[error.code ?? ''] ?? error.message ?? fallback
}
