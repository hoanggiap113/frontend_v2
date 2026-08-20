import { ApiError } from '#/lib/client'

type AuthContext = 'login' | 'register'
type AuthFeedbackVariant = 'error' | 'warning' | 'success' | 'info'

interface AuthFeedback {
  title: string
  description: string
  variant: AuthFeedbackVariant
  shouldVerifyEmail?: boolean
}

const AUTH_ERROR_MESSAGES: Record<string, AuthFeedback> = {
  INVALID_CREDENTIALS: {
    title: 'Không đăng nhập được',
    description: 'Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.',
    variant: 'error',
  },
  EMAIL_NOT_VERIFIED: {
    title: 'Email chưa xác thực',
    description:
      'Tài khoản này đã đăng ký nhưng chưa xác thực. Vui lòng nhập mã OTP trong email.',
    variant: 'warning',
    shouldVerifyEmail: true,
  },
  EMAIL_EXISTS: {
    title: 'Email đã được sử dụng',
    description:
      'Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác.',
    variant: 'error',
  },
  ACCOUNT_LOCKED: {
    title: 'Tài khoản bị khóa',
    description:
      'Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
    variant: 'error',
  },
  ACCOUNT_DELETED: {
    title: 'Tài khoản không còn tồn tại',
    description: 'Tài khoản này đã bị xóa hoặc không còn khả dụng.',
    variant: 'error',
  },
  VALIDATION_ERROR: {
    title: 'Thông tin chưa hợp lệ',
    description: 'Vui lòng kiểm tra lại các trường thông tin vừa nhập.',
    variant: 'error',
  },
  UNAUTHORIZED: {
    title: 'Phiên đăng nhập không hợp lệ',
    description: 'Vui lòng đăng nhập lại để tiếp tục.',
    variant: 'warning',
  },
  INTERNAL_ERROR: {
    title: 'Hệ thống đang gặp sự cố',
    description:
      'Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại sau ít phút.',
    variant: 'error',
  },
}

export function getAuthErrorFeedback(
  error: unknown,
  context: AuthContext,
): AuthFeedback {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        title: 'Trình duyệt không nhận được phản hồi',
        description: import.meta.env.DEV
          ? 'Backend có thể đã trả 200 nhưng response bị chặn bởi CORS hoặc cookie policy. Mở Console và kiểm tra log [http].'
          : 'Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
        variant: 'error',
      }
    }

    const mapped = error.code ? AUTH_ERROR_MESSAGES[error.code] : undefined
    if (mapped) {
      return {
        ...mapped,
        description:
          error.code === 'VALIDATION_ERROR'
            ? (getValidationMessage(error.message) ?? mapped.description)
            : mapped.description,
      }
    }

    if (error.status >= 500) return AUTH_ERROR_MESSAGES.INTERNAL_ERROR
    if (error.status === 401 || error.status === 403) {
      return context === 'login'
        ? AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
        : AUTH_ERROR_MESSAGES.UNAUTHORIZED
    }

    return {
      title: context === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại',
      description: getHumanMessage(error.message, context),
      variant: 'error',
    }
  }

  if (error instanceof TypeError) {
    return {
      title: 'Không kết nối được máy chủ',
      description: 'Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
      variant: 'error',
    }
  }

  if (error instanceof Error && /invalid credentials/i.test(error.message)) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
  }

  return {
    title: context === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại',
    description:
      context === 'login'
        ? 'Không thể đăng nhập lúc này. Vui lòng thử lại.'
        : 'Không thể tạo tài khoản lúc này. Vui lòng thử lại.',
    variant: 'error',
  }
}

function getValidationMessage(message?: string) {
  if (!message) return undefined
  const normalized = message.toLowerCase()

  if (normalized.includes('email'))
    return 'Email chưa hợp lệ. Vui lòng kiểm tra lại.'
  if (normalized.includes('password'))
    return 'Mật khẩu chưa hợp lệ. Vui lòng kiểm tra lại.'
  if (normalized.includes('name'))
    return 'Tên hiển thị chưa hợp lệ. Vui lòng kiểm tra lại.'

  return undefined
}

function getHumanMessage(message: string | undefined, context: AuthContext) {
  if (!message) {
    return context === 'login'
      ? 'Vui lòng kiểm tra email, mật khẩu và thử lại.'
      : 'Vui lòng kiểm tra thông tin đăng ký và thử lại.'
  }

  const normalized = message.toLowerCase()
  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network')
  ) {
    return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.'
  }
  if (normalized.includes('email already exists')) {
    return AUTH_ERROR_MESSAGES.EMAIL_EXISTS.description
  }
  if (normalized.includes('invalid email or password')) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS.description
  }

  return message
}
