import { appConfig } from '#/lib/env'
import {
  readAccessToken,
  readCurrentTenantId,
} from '#/lib/browser-storage'
import { endpoints } from '#/lib/services/endpoints'
import { ApiError } from '#/lib/services/http/client'
import type {
  AgentActionResponse,
  AgentApproveRequest,
  AgentChatRequest,
  AgentModelCatalog,
  AgentSessionsResponse,
  AgentSessionMessagesResponse,
  AgentSseEvent,
  AgentTestKeyRequest,
  AgentTestKeyResponse,
} from '../types/chatbot'

interface StreamChatHandlers {
  onEvent?: (event: AgentSseEvent) => void
  onToken?: (text: string) => void
  onStatus?: (event: Extract<AgentSseEvent, { type: 'status' }>) => void
  onTool?: (event: Extract<AgentSseEvent, { type: 'tool' }>) => void
  onUsage?: (event: Extract<AgentSseEvent, { type: 'usage' }>) => void
  onDone?: () => void
  onError?: (message: string) => void
}

function getAccessToken() {
  return readAccessToken()
}

function getCurrentTenantId() {
  return readCurrentTenantId()
}

function buildAgentUrl(path: string, query?: Record<string, string | number>) {
  const baseUrl = appConfig.agentApiBaseUrl.replace(/\/$/, '')
  const endpoint = path.replace(/^\//, '')
  const url = new URL(
    `${baseUrl}/${endpoint}`,
    /^https?:/i.test(baseUrl) ? undefined : window.location.origin,
  )

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

function buildJsonHeaders() {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const tenantId = getCurrentTenantId()
  if (tenantId) headers.set('X-Tenant-Id', tenantId)

  return headers
}

function assertAgentContext() {
  const token = getAccessToken()
  if (!token) {
    throw new ApiError({
      status: 401,
      message: 'Bạn cần đăng nhập trước khi dùng chatbot.',
      data: null,
    })
  }

  const tenantId = getCurrentTenantId()
  if (!tenantId) {
    throw new ApiError({
      status: 400,
      message: 'Chưa chọn workspace để dùng chatbot.',
      data: null,
    })
  }
}

async function parseAgentResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => undefined)

  if (!response.ok) {
    const rawMessage =
      getAgentErrorMessage(body) || response.statusText || `HTTP ${response.status}`
    const message = getFriendlyAgentErrorMessage(rawMessage, response.status)

    throw new ApiError({
      status: response.status,
      message,
      data: body,
    })
  }

  return body as T
}

function getAgentErrorMessage(body: unknown) {
  if (!body || typeof body !== 'object') return ''

  if ('detail' in body) {
    const detail = body.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map(String).join(', ')
  }

  if ('message' in body && typeof body.message === 'string') {
    return body.message
  }

  return ''
}

function getFriendlyAgentErrorMessage(message: string, status?: number) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('api key') &&
    (normalized.includes('invalid') ||
      normalized.includes('expired') ||
      normalized.includes('unauthorized') ||
      normalized.includes('permission') ||
      normalized.includes('key not valid'))
  ) {
    return 'API key không hợp lệ hoặc đã hết hạn.'
  }

  if (
    status === 401 ||
    normalized.includes('token') ||
    normalized.includes('unauthorized')
  ) {
    return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
  }

  if (
    status === 403 ||
    normalized.includes('permission_denied') ||
    normalized.includes('forbidden')
  ) {
    return 'API key hoặc tài khoản hiện tại không có quyền dùng model này.'
  }

  if (
    status === 503 ||
    normalized.includes('503') ||
    normalized.includes('unavailable') ||
    normalized.includes('high demand')
  ) {
    return (
      'Model AI đang quá tải tạm thời. Bạn đợi một lát rồi thử lại, ' +
      'hoặc chuyển sang model Flash/Lite để ổn định hơn.'
    )
  }

  if (
    status === 429 ||
    normalized.includes('429') ||
    normalized.includes('resource_exhausted') ||
    normalized.includes('quota exceeded') ||
    normalized.includes('rate limit')
  ) {
    const retryMatch = message.match(/retry in\s+([\d.]+)s/i)
    const retryText = retryMatch
      ? ` Thử lại sau khoảng ${Math.ceil(Number(retryMatch[1]))} giây.`
      : ''

    return (
      'API key hoặc model đang hết quota hoặc bị giới hạn tốc độ.' +
      retryText +
      ' Nếu đang dùng model Pro, hãy thử model Flash/Lite hoặc kiểm tra billing/quota.'
    )
  }

  if (
    status === 409 ||
    normalized.includes('409') ||
    normalized.includes('conflict') ||
    normalized.includes('already running') ||
    normalized.includes('concurrent')
  ) {
    return (
      'Phiên chat này đang có một yêu cầu khác được xử lý. ' +
      'Vui lòng đợi câu trả lời hiện tại kết thúc rồi gửi lại.'
    )
  }

  if (status && status >= 500) {
    return 'Chatbot đang gặp lỗi tạm thời. Bạn thử lại sau ít phút.'
  }

  return message
}

async function agentGet<T>(
  path: string,
  query?: Record<string, string | number>,
  options: { requiresAuth?: boolean } = {},
) {
  if (options.requiresAuth !== false) assertAgentContext()
  const response = await fetch(buildAgentUrl(path, query), {
    method: 'GET',
    headers: buildJsonHeaders(),
  })

  return parseAgentResponse<T>(response)
}

async function agentPost<T>(
  path: string,
  body?: unknown,
  options: { requiresAuth?: boolean } = {},
) {
  if (options.requiresAuth !== false) assertAgentContext()
  const response = await fetch(buildAgentUrl(path), {
    method: 'POST',
    headers: buildJsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  return parseAgentResponse<T>(response)
}

function emitSseEvent(event: AgentSseEvent, handlers: StreamChatHandlers) {
  handlers.onEvent?.(event)

  if (event.type === 'token') handlers.onToken?.(event.text)
  if (event.type === 'status') handlers.onStatus?.(event)
  if (event.type === 'tool') handlers.onTool?.(event)
  if (event.type === 'usage') handlers.onUsage?.(event)
  if (event.type === 'done') handlers.onDone?.()
  if (event.type === 'error') {
    handlers.onError?.(getFriendlyAgentErrorMessage(event.text))
  }
}

function parseSseBlock(block: string): AgentSseEvent | null {
  const data = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, ''))
    .join('\n')
    .trim()

  if (!data) return null

  try {
    return JSON.parse(data) as AgentSseEvent
  } catch {
    return {
      type: 'error',
      text: 'Không đọc được dữ liệu trả về từ chatbot.',
    }
  }
}

async function consumeSseStream(
  stream: ReadableStream<Uint8Array>,
  handlers: StreamChatHandlers,
) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    blocks.forEach((block) => {
      const event = parseSseBlock(block)
      if (event) emitSseEvent(event, handlers)
    })
  }

  if (buffer.trim()) {
    const event = parseSseBlock(buffer)
    if (event) emitSseEvent(event, handlers)
  }
}

export const chatbotService = {
  models() {
    return agentGet<AgentModelCatalog>(
      endpoints.agent.models,
      undefined,
      { requiresAuth: false },
    )
  },

  health() {
    return agentGet(endpoints.agent.health, undefined, { requiresAuth: false })
  },

  testKey(payload: AgentTestKeyRequest) {
    return agentPost<AgentTestKeyResponse>(
      endpoints.agent.testKey,
      payload,
      { requiresAuth: false },
    )
  },

  sessions(limit = 20) {
    return agentGet<AgentSessionsResponse>(endpoints.agent.sessions, { limit })
  },

  sessionMessages(sessionId: string) {
    return agentGet<AgentSessionMessagesResponse>(
      endpoints.agent.sessionMessages(sessionId),
    )
  },

  approve(payload: AgentApproveRequest) {
    return agentPost<AgentActionResponse>(endpoints.agent.approve, payload)
  },

  reject(payload: AgentApproveRequest) {
    return agentPost<AgentActionResponse>(endpoints.agent.reject, payload)
  },

  async streamChat(
    payload: AgentChatRequest,
    handlers: StreamChatHandlers,
    signal?: AbortSignal,
  ) {
    assertAgentContext()
    const response = await fetch(buildAgentUrl(endpoints.agent.chat), {
      method: 'POST',
      headers: buildJsonHeaders(),
      body: JSON.stringify(payload),
      signal,
    })

    if (!response.ok) {
      await parseAgentResponse(response)
      return
    }

    if (!response.body) {
      throw new ApiError({
        status: response.status,
        message: 'Chatbot không trả về luồng phản hồi.',
        data: null,
      })
    }

    await consumeSseStream(response.body, handlers)
  },
}
