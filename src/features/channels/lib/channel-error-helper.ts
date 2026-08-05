import { ApiError } from '#/shared/service/http/client'

type ChannelAction =
  | 'list'
  | 'detail'
  | 'create'
  | 'update'
  | 'delete'
  | 'sync'

const ACTION_FALLBACK_MESSAGES: Record<string, string> = {
  list: 'Không tải được danh sách kênh. Vui lòng thử lại sau.',
  detail: 'Không tải được thông tin kênh. Vui lòng thử lại sau.',
  create: 'Không kết nối được kênh. Vui lòng kiểm tra thông tin và thử lại.',
  update: 'Không cập nhật được kênh. Vui lòng kiểm tra thông tin và thử lại.',
  delete: 'Không xóa được kênh. Vui lòng thử lại sau.',
  sync: 'Không thể đồng bộ kênh lúc này. Vui lòng thử lại sau.',
}

const CHANNEL_ERROR_MESSAGES: Record<string, string> = {
  CHANNEL_ALREADY_EXISTS:
    'Kênh này đã được kết nối trong workspace. Vui lòng kiểm tra Page ID hoặc chọn kênh khác.',
  CHANNEL_INVALID_CREDENTIALS:
    'Thông tin kết nối không hợp lệ hoặc token đã hết hạn. Vui lòng kiểm tra Page ID và access token.',
  CHANNEL_SYNC_IN_PROGRESS:
    'Kênh này đang đồng bộ. Vui lòng chờ quá trình hiện tại hoàn tất rồi thử lại.',
  CHANNEL_ACCESS_DENIED:
    'Bạn không có quyền thao tác với kênh này trong workspace hiện tại.',
  INSUFFICIENT_PERMISSIONS:
    'Bạn cần quyền Owner hoặc Admin để thực hiện thao tác này.',
  CHANNEL_NOT_FOUND:
    'Không tìm thấy kênh này. Có thể kênh đã bị xóa hoặc bạn không còn quyền truy cập.',
  TENANT_NOT_FOUND:
    'Không tìm thấy workspace hiện tại. Vui lòng chọn lại workspace.',
  UNAUTHORIZED:
    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN:
    'Bạn không có quyền thực hiện thao tác này.',
  INTERNAL_ERROR:
    'Máy chủ đang gặp sự cố khi xử lý kênh. Vui lòng thử lại sau ít phút.',
}

export function getChannelErrorMessage(
  error: unknown,
  action: ChannelAction,
  fallback = ACTION_FALLBACK_MESSAGES[action],
) {
  if (error instanceof ApiError) {
    if (error.code && CHANNEL_ERROR_MESSAGES[error.code]) {
      return CHANNEL_ERROR_MESSAGES[error.code]
    }

    if (isDuplicateChannelError(error)) {
      return CHANNEL_ERROR_MESSAGES.CHANNEL_ALREADY_EXISTS
    }

    if (error.code === 'VALIDATION_ERROR') {
      return getValidationMessage(error.message, action)
    }

    if (error.status === 401) return CHANNEL_ERROR_MESSAGES.UNAUTHORIZED
    if (error.status === 403) return CHANNEL_ERROR_MESSAGES.FORBIDDEN
    if (error.status === 404) return CHANNEL_ERROR_MESSAGES.CHANNEL_NOT_FOUND
    if (error.status >= 500) return CHANNEL_ERROR_MESSAGES.INTERNAL_ERROR

    return getHumanMessage(error.message) || fallback
  }

  if (error instanceof TypeError) {
    return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.'
  }

  if (error instanceof Error) {
    return getHumanMessage(error.message) || fallback
  }

  return fallback
}

function isDuplicateChannelError(error: ApiError) {
  const message = normalize(error.message)
  const body = normalize(JSON.stringify(error.data ?? ''))

  return (
    error.status === 409 ||
    message.includes('unique') ||
    message.includes('duplicate') ||
    message.includes('already exists') ||
    message.includes('rang buoc duy nhat') ||
    body.includes('channels') && body.includes('external_id') ||
    body.includes('uk') && body.includes('channel')
  )
}

function getValidationMessage(message: string | undefined, action: ChannelAction) {
  const normalized = normalize(message)

  if (!normalized) return ACTION_FALLBACK_MESSAGES[action]

  if (normalized.includes('channel name') || normalized.includes('ten kenh')) {
    return 'Tên kênh không được để trống.'
  }

  if (normalized.includes('channeltype') || normalized.includes('channel type')) {
    return 'Loại kênh chưa hợp lệ. Vui lòng chọn lại loại kênh.'
  }

  if (normalized.includes('credentials') || normalized.includes('pageid')) {
    return 'Thiếu Page ID hoặc access token. Vui lòng kiểm tra lại thông tin kết nối.'
  }

  return ACTION_FALLBACK_MESSAGES[action]
}

function getHumanMessage(message: string | undefined) {
  const normalized = normalize(message)
  if (!normalized) return undefined

  if (normalized.includes('no provider registered')) {
    return 'Loại kênh này chưa khả dụng.'
  }

  if (
    normalized.includes('facebook api error') ||
    normalized.includes('pancake api error')
  ) {
    return 'Không kiểm tra được kênh từ nhà cung cấp. Vui lòng kiểm tra token hoặc thử lại sau.'
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.'
  }

  return undefined
}

function normalize(value: string | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
