import { useSyncExternalStore } from 'react'
import { chatbotService } from '../service/chatbot.service'
import type {
  AgentSseEvent,
  AgentSessionMessage,
  AgentSessionSummary,
  ChatbotErrorFeedback,
  ChatbotApiKeyConfig,
  ChatbotMessage,
  ChatbotPendingApproval,
  ChatbotThread,
} from '../types/chatbot'

const CHATBOT_API_KEY_STORAGE = 'cqa_chatbot_api_key_config'
const LEGACY_CHATBOT_API_KEY_STORAGE = CHATBOT_API_KEY_STORAGE
const WAITING_APPROVAL_MARKER = '[SYSTEM_ACTION: WAITING_APPROVAL]'
const APPROVAL_MARKERS = [
  WAITING_APPROVAL_MARKER,
  '[SYSTEM_ACTION: WAITING_DRAFT_APPROVAL]',
  '[SYSTEM_ACTION: WAITING_SAVE_APPROVAL]',
]
const RULE_CONTENT_MARKER = '**Nội dung bộ quy tắc:**'
const RULE_CONFIG_MARKER = '**rules_config:**'
const APPROVAL_QUESTION_MARKER = 'Bạn có đồng ý'
const PROCESSING_MESSAGE_PREFIX = 'processing_'

interface ChatbotRuntimeState {
  threads: ChatbotThread[]
  selectedId: string
  search: string
  streamingThreadId: string | null
  apiKeyConfig: ChatbotApiKeyConfig | null
}

type Listener = () => void

const listeners = new Set<Listener>()

function getCurrentTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAgentTime(value?: string | null) {
  if (!value) return getCurrentTime()

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return getCurrentTime()

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeAgentContent(content: string, threadId: string) {
  return {
    content: normalizeApprovalContent(content),
    pendingApproval: buildPendingApproval(content, threadId),
  }
}

function hasApprovalMarker(content: string) {
  return APPROVAL_MARKERS.some((marker) => content.includes(marker))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readJsonLike(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value)
    } catch {
      return value.trim()
    }
  }

  if (isRecord(value) || Array.isArray(value)) return value
  return undefined
}

function parsePendingApprovalAction(
  raw: unknown,
): ChatbotPendingApproval['action'] {
  if (typeof raw === 'string') {
    try {
      return parsePendingApprovalAction(JSON.parse(raw))
    } catch {
      return undefined
    }
  }

  if (!isRecord(raw)) return undefined

  const args = isRecord(raw.args) ? raw.args : raw

  return {
    toolName: readString(raw.tool_name) || readString(raw.toolName),
    jobId: readString(args.job_id) || readString(args.jobId),
    title: readString(args.name),
    description: readString(args.description),
    rulesContent:
      readString(args.rules_content) || readString(args.rulesContent),
    rulesConfig:
      readJsonLike(args.rules_config) || readJsonLike(args.rulesConfig),
  }
}

function parseRulesConfigFromContent(content: string) {
  const markerIndex = content.indexOf(RULE_CONFIG_MARKER)
  if (markerIndex === -1) return undefined

  const afterMarker = content
    .slice(markerIndex + RULE_CONFIG_MARKER.length)
    .trim()
  const fencedMatch = afterMarker.match(/^```(?:json)?\s*([\s\S]*?)```/i)
  const rawConfig = fencedMatch?.[1]?.trim() || afterMarker.trim()

  if (!rawConfig) return undefined

  try {
    return JSON.parse(rawConfig)
  } catch {
    return rawConfig
  }
}

function parseApprovalActionFromContent(
  content: string,
): ChatbotPendingApproval['action'] {
  if (!hasApprovalMarker(content)) return undefined

  const cleanContent = stripApprovalMarkers(content)
  const titleMatch = cleanContent.match(/quy tắc CSKH mới:\s*\*\*(.+?)\*\*/i)
  const markerIndex = cleanContent.indexOf(RULE_CONTENT_MARKER)

  if (markerIndex === -1) {
    return {
      toolName: 'cqa_update_guideline',
      title: titleMatch?.[1]?.trim(),
    }
  }

  const afterMarker = cleanContent
    .slice(markerIndex + RULE_CONTENT_MARKER.length)
    .trim()
  const questionIndex = afterMarker.indexOf(APPROVAL_QUESTION_MARKER)
  const configIndex = afterMarker.indexOf(RULE_CONFIG_MARKER)
  const stopIndexes = [questionIndex, configIndex].filter((index) => index >= 0)
  const stopIndex = stopIndexes.length > 0 ? Math.min(...stopIndexes) : -1
  const rulesContent =
    stopIndex >= 0
      ? afterMarker.slice(0, stopIndex).trim()
      : afterMarker.trim()

  return {
    toolName: 'cqa_update_guideline',
    title: titleMatch?.[1]?.trim(),
    rulesContent: rulesContent || undefined,
    rulesConfig: parseRulesConfigFromContent(cleanContent),
  }
}

function buildSessionPendingApproval(
  session: AgentSessionSummary,
): ChatbotPendingApproval | undefined {
  const action = parsePendingApprovalAction(session.pending_action)
  if (!action) return undefined

  return {
    sessionId: session.thread_id,
    status: 'pending',
    action,
  }
}

function isRunningStatus(status?: string | null) {
  return status === 'running'
}

function createProcessingMessage(threadId: string): ChatbotMessage {
  return {
    id: `${PROCESSING_MESSAGE_PREFIX}${threadId}`,
    role: 'assistant',
    content: '',
    sentAt: getCurrentTime(),
    isStreaming: true,
  }
}

function ensureProcessingMessage(
  messages: ChatbotMessage[],
  threadId: string,
  status?: string | null,
) {
  const withoutProcessing = messages.filter(
    (message) => !message.id.startsWith(PROCESSING_MESSAGE_PREFIX),
  )

  if (!isRunningStatus(status)) return withoutProcessing

  const lastMessage = withoutProcessing.at(-1)
  if (lastMessage?.role === 'assistant') return withoutProcessing

  return [...withoutProcessing, createProcessingMessage(threadId)]
}

function mapAgentMessage(
  message: AgentSessionMessage,
  threadId: string,
): ChatbotMessage {
  const isUser = message.role === 'human' || message.role === 'user'
  const { content, pendingApproval } = normalizeAgentContent(
    message.content || '',
    threadId,
  )
  const inputTokens = message.input_tokens ?? 0
  const outputTokens = message.output_tokens ?? 0

  return {
    id: message.id,
    role: isUser ? 'user' : 'assistant',
    content,
    sentAt: formatAgentTime(message.created_at),
    pendingApproval: isUser ? undefined : pendingApproval,
    usage:
      !isUser && (inputTokens > 0 || outputTokens > 0)
        ? {
            inputTokens,
            outputTokens,
          }
        : undefined,
  }
}

function mapAgentSession(session: AgentSessionSummary): ChatbotThread {
  const preview = session.title || session.last_message_preview || ''
  const pendingApproval = buildSessionPendingApproval(session)

  return {
    id: session.thread_id,
    botName: 'CQA Agent',
    firstUserMessage:
      preview || (pendingApproval ? 'Đang chờ duyệt cập nhật bộ quy tắc' : ''),
    lastMessagePreview: session.last_message_preview,
    updatedAt: formatAgentTime(session.last_activity_at || session.created_at),
    status: session.status,
    messages: [],
    pendingApproval,
    messagesLoaded: false,
  }
}

function createEmptyThread(): ChatbotThread {
  return {
    id: `local_chat_${Date.now()}`,
    botName: 'CQA Agent',
    firstUserMessage: '',
    lastMessagePreview: '',
    updatedAt: getCurrentTime(),
    status: 'active',
    messages: [],
    messagesLoaded: true,
  }
}

function isLocalThreadId(threadId: string) {
  return threadId.startsWith('local_chat_')
}

function readApiKeyConfig(): ChatbotApiKeyConfig | null {
  if (typeof window === 'undefined') return null

  const raw =
    window.localStorage.getItem(CHATBOT_API_KEY_STORAGE) ||
    window.sessionStorage.getItem(LEGACY_CHATBOT_API_KEY_STORAGE)
  if (!raw) return null

  try {
    const config = JSON.parse(raw) as ChatbotApiKeyConfig
    window.localStorage.setItem(CHATBOT_API_KEY_STORAGE, JSON.stringify(config))
    window.sessionStorage.removeItem(LEGACY_CHATBOT_API_KEY_STORAGE)
    return config
  } catch {
    window.localStorage.removeItem(CHATBOT_API_KEY_STORAGE)
    window.sessionStorage.removeItem(CHATBOT_API_KEY_STORAGE)
    return null
  }
}

function saveApiKeyConfig(config: ChatbotApiKeyConfig) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHATBOT_API_KEY_STORAGE, JSON.stringify(config))
  window.sessionStorage.removeItem(LEGACY_CHATBOT_API_KEY_STORAGE)
}

function buildLlmRequestConfig(config: ChatbotApiKeyConfig) {
  const isClaude = config.provider === 'claude'
  const anthropicAuthToken =
    config.anthropicAuthToken?.trim() || config.apiKey.trim()
  const anthropicBaseUrl = config.anthropicBaseUrl?.trim()

  return {
    llm_provider: config.provider,
    model_name: config.model,
    api_key: isClaude ? anthropicAuthToken : config.apiKey.trim(),
    ...(isClaude
      ? {
          anthropic_base_url: anthropicBaseUrl || null,
          anthropic_auth_token: anthropicAuthToken || null,
        }
      : {}),
  }
}

function stripApprovalMarkers(content: string) {
  return APPROVAL_MARKERS.reduce(
    (current, marker) => current.replace(marker, ''),
    content,
  ).trim()
}

function normalizeApprovalContent(content: string) {
  if (!hasApprovalMarker(content)) return content

  const cleanContent = stripApprovalMarkers(content)
  const markerIndex = cleanContent.indexOf(RULE_CONTENT_MARKER)
  if (markerIndex === -1) return cleanContent

  const beforeRules = cleanContent.slice(0, markerIndex).trim()
  const afterMarker = cleanContent
    .slice(markerIndex + RULE_CONTENT_MARKER.length)
    .trim()
  const questionIndex = afterMarker.indexOf(APPROVAL_QUESTION_MARKER)
  const afterRules =
    questionIndex >= 0 ? afterMarker.slice(questionIndex).trim() : ''

  return [beforeRules, afterRules].filter(Boolean).join('\n\n')
}

function buildPendingApproval(
  content: string,
  threadId: string,
  action?: ChatbotPendingApproval['action'],
): ChatbotPendingApproval | undefined {
  if (!hasApprovalMarker(content)) return undefined

  return {
    sessionId: threadId,
    status: 'pending',
    action: action ?? parseApprovalActionFromContent(content),
  }
}

function createApprovalMessage(
  threadId: string,
  pendingApproval: ChatbotPendingApproval,
): ChatbotMessage {
  return {
    id: `approval_${threadId}`,
    role: 'assistant',
    content:
      'Agent đã soạn đề xuất cập nhật bộ quy tắc. Vui lòng kiểm tra và duyệt hoặc từ chối bên dưới.',
    sentAt: getCurrentTime(),
    pendingApproval,
  }
}

function ensureApprovalMessage(
  messages: ChatbotMessage[],
  pendingApproval?: ChatbotPendingApproval,
) {
  if (!pendingApproval || pendingApproval.status !== 'pending') return messages

  const hasApprovalMessage = messages.some((message) => message.pendingApproval)
  if (hasApprovalMessage) {
    return messages.map((message) =>
      message.pendingApproval
        ? {
            ...message,
            pendingApproval: {
              ...pendingApproval,
              action: message.pendingApproval.action ?? pendingApproval.action,
            },
          }
        : message,
    )
  }

  return [
    ...messages,
    createApprovalMessage(pendingApproval.sessionId, pendingApproval),
  ]
}

function createInitialState(): ChatbotRuntimeState {
  const thread = createEmptyThread()
  return {
    threads: [thread],
    selectedId: thread.id,
    search: '',
    streamingThreadId: null,
    apiKeyConfig: readApiKeyConfig(),
  }
}

let state = createInitialState()

function emit(nextState: ChatbotRuntimeState) {
  state = nextState
  listeners.forEach((listener) => listener())
}

function setState(
  updater: (current: ChatbotRuntimeState) => ChatbotRuntimeState,
) {
  emit(updater(state))
}

function updateThread(
  threadId: string,
  updater: (thread: ChatbotThread) => ChatbotThread,
) {
  setState((current) => ({
    ...current,
    threads: current.threads.map((thread) =>
      thread.id === threadId ? updater(thread) : thread,
    ),
  }))
}

function replaceThreadId(oldThreadId: string, nextThreadId: string) {
  if (oldThreadId === nextThreadId) return

  setState((current) => ({
    ...current,
    selectedId:
      current.selectedId === oldThreadId ? nextThreadId : current.selectedId,
    streamingThreadId:
      current.streamingThreadId === oldThreadId
        ? nextThreadId
        : current.streamingThreadId,
    threads: current.threads.map((thread) =>
      thread.id === oldThreadId
        ? {
            ...thread,
            id: nextThreadId,
            pendingApproval: thread.pendingApproval
              ? {
                  ...thread.pendingApproval,
                  sessionId: nextThreadId,
                }
              : thread.pendingApproval,
            messages: thread.messages.map((message) =>
              message.pendingApproval
                ? {
                    ...message,
                    pendingApproval: {
                      ...message.pendingApproval,
                      sessionId: nextThreadId,
                    },
                  }
                : message,
            ),
          }
        : thread,
    ),
  }))
}

function updateAssistantMessage(
  threadId: string,
  messageId: string,
  updater: (content: string) => string,
  isStreaming = true,
) {
  updateThread(threadId, (thread) => ({
    ...thread,
    updatedAt: getCurrentTime(),
    messages: thread.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            content: updater(message.content),
            isStreaming,
          }
        : message,
    ),
  }))
}

function updateAssistantUsage(
  threadId: string,
  messageId: string,
  usage: { inputTokens: number; outputTokens: number },
) {
  updateThread(threadId, (thread) => ({
    ...thread,
    updatedAt: getCurrentTime(),
    messages: thread.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            usage,
          }
        : message,
    ),
  }))
}

function updateAssistantSnapshot(
  threadId: string,
  messageId: string,
  snapshot: {
    content?: string
    errorFeedback?: ChatbotErrorFeedback
    isStreaming?: boolean
    pendingApproval?: ChatbotPendingApproval
  },
) {
  updateThread(threadId, (thread) => ({
    ...thread,
    updatedAt: getCurrentTime(),
    pendingApproval: snapshot.pendingApproval ?? thread.pendingApproval,
    messages: thread.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            ...snapshot,
          }
        : message,
    ),
  }))
}

function getChatbotErrorFeedback(rawMessage: string): ChatbotErrorFeedback {
  const message = rawMessage.trim()
  const normalized = message.toLowerCase()

  if (
    normalized.includes('api key') &&
    (normalized.includes('không hợp lệ') ||
      normalized.includes('het han') ||
      normalized.includes('hết hạn') ||
      normalized.includes('invalid') ||
      normalized.includes('expired') ||
      normalized.includes('unauthorized') ||
      normalized.includes('permission'))
  ) {
    return {
      title: 'API key không dùng được',
      description:
        'Key hiện tại bị từ chối hoặc không còn quyền gọi model đã chọn.',
      suggestions: [
        'Mở cấu hình API key và nhập lại key mới.',
        'Kiểm tra key có quyền dùng đúng provider/model đang chọn.',
        'Nếu key vừa đổi quyền, thử gửi lại sau vài giây.',
      ],
    }
  }

  if (
    normalized.includes('503') ||
    normalized.includes('unavailable') ||
    normalized.includes('high demand') ||
    normalized.includes('quá tải') ||
    normalized.includes('qua tai')
  ) {
    return {
      title: 'Model AI đang quá tải',
      description:
        'Provider AI đang bận hoặc model hiện tại tạm thời không phục vụ được yêu cầu.',
      suggestions: [
        'Đợi một lát rồi gửi lại câu hỏi.',
        'Chuyển sang model Flash/Lite để ổn định hơn.',
        'Nếu đang dùng model Pro, thử lại ngoài giờ cao điểm.',
      ],
    }
  }

  if (
    normalized.includes('429') ||
    normalized.includes('quota') ||
    normalized.includes('rate limit') ||
    normalized.includes('resource_exhausted') ||
    normalized.includes('billing') ||
    normalized.includes('giới hạn')
  ) {
    return {
      title: 'API key bị giới hạn quota',
      description:
        'Key hoặc tài khoản provider đã chạm giới hạn gọi model trong thời điểm hiện tại.',
      suggestions: [
        'Kiểm tra quota, billing hoặc hạn mức của API key.',
        'Thử model nhẹ hơn như Flash/Lite.',
        'Đợi reset quota rồi gửi lại.',
      ],
    }
  }

  if (
    normalized.includes('409') ||
    normalized.includes('conflict') ||
    normalized.includes('already running') ||
    normalized.includes('concurrent') ||
    normalized.includes('đang có một yêu cầu khác') ||
    normalized.includes('dang co mot yeu cau khac')
  ) {
    return {
      title: 'Đoạn chat đang xử lý yêu cầu trước',
      description:
        'Agent vẫn đang hoàn tất câu trả lời trước đó nên chưa nhận yêu cầu mới.',
      suggestions: [
        'Đợi phản hồi hiện tại kết thúc rồi gửi lại.',
        'Nếu chờ quá lâu, tạo đoạn chat mới và thử lại.',
      ],
    }
  }

  if (
    normalized.includes('token không hợp lệ') ||
    normalized.includes('token khong hop le') ||
    normalized.includes('đăng nhập') ||
    normalized.includes('dang nhap') ||
    normalized.includes('401')
  ) {
    return {
      title: 'Phiên đăng nhập không còn hợp lệ',
      description:
        'Agent không xác thực được người dùng hoặc workspace hiện tại.',
      suggestions: [
        'Đăng nhập lại rồi gửi câu hỏi.',
        'Kiểm tra bạn đã chọn đúng workspace.',
      ],
    }
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('không kết nối') ||
    normalized.includes('khong ket noi') ||
    normalized.includes('connection')
  ) {
    return {
      title: 'Không kết nối được agent',
      description:
        'Trình duyệt chưa kết nối được tới dịch vụ chatbot trong lúc gửi câu hỏi.',
      suggestions: [
        'Kiểm tra dịch vụ chatbot có đang chạy không.',
        'Kiểm tra mạng hoặc URL agent trong file env frontend.',
        'Thử tải lại trang rồi gửi lại.',
      ],
    }
  }

  if (
    normalized.includes('model') &&
    (normalized.includes('not found') ||
      normalized.includes('unsupported') ||
      normalized.includes('không hỗ trợ') ||
      normalized.includes('khong ho tro'))
  ) {
    return {
      title: 'Model chưa khả dụng',
      description:
        'Model đang chọn không tồn tại hoặc API key chưa có quyền sử dụng model này.',
      suggestions: [
        'Chọn lại model trong cấu hình chatbot.',
        'Kiểm tra provider và API key có khớp nhau không.',
      ],
    }
  }

  return {
    title: 'Chatbot chưa xử lý được yêu cầu',
    description:
      message || 'Có lỗi xảy ra trong lúc agent tạo câu trả lời.',
    suggestions: [
      'Thử gửi lại câu hỏi sau vài giây.',
      'Nếu lỗi lặp lại, kiểm tra API key và trạng thái dịch vụ chatbot.',
    ],
  }
}

function updateApprovalStatus(
  threadId: string,
  messageId: string,
  status: ChatbotPendingApproval['status'],
) {
  updateThread(threadId, (thread) => ({
    ...thread,
    updatedAt: getCurrentTime(),
    pendingApproval: thread.pendingApproval
      ? {
          ...thread.pendingApproval,
          status,
        }
      : thread.pendingApproval,
    messages: thread.messages.map((message) => {
      if (message.id !== messageId || !message.pendingApproval) return message

      return {
        ...message,
        pendingApproval: {
          ...message.pendingApproval,
          status,
        },
      }
    }),
  }))
}

function appendAssistantMessage(threadId: string, content: string) {
  const sentAt = getCurrentTime()
  const assistantMessageId = `assistant_${Date.now()}`

  updateThread(threadId, (thread) => ({
    ...thread,
    updatedAt: sentAt,
    messages: [
      ...thread.messages,
      {
        id: assistantMessageId,
        role: 'assistant',
        content,
        sentAt,
      },
    ],
  }))
}

function finishAssistantMessage(threadId: string, messageId: string) {
  updateThread(threadId, (thread) => ({
    ...thread,
    updatedAt: getCurrentTime(),
    messages: thread.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            isStreaming: false,
          }
        : message,
    ),
  }))
}

function setSelectedId(selectedId: string) {
  setState((current) => ({ ...current, selectedId }))
}

async function loadThreadMessages(threadId: string) {
  const thread = state.threads.find((item) => item.id === threadId)
  if (!thread || thread.messagesLoaded || thread.messages.length > 0) return

  try {
    const response = await chatbotService.sessionMessages(threadId)
    const pendingApproval = thread.pendingApproval
    const messages = ensureProcessingMessage(
      ensureApprovalMessage(
        response.messages.map((message) => mapAgentMessage(message, threadId)),
        pendingApproval,
      ),
      threadId,
      thread.status,
    )

    updateThread(threadId, (currentThread) => ({
      ...currentThread,
      messages,
      messagesLoaded: true,
      firstUserMessage:
        currentThread.firstUserMessage ||
        messages.find((message) => message.role === 'user')?.content ||
        '',
    }))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Không thể tải lịch sử chat.'
    appendAssistantMessage(threadId, `Không thể tải lịch sử chat: ${message}`)
    updateThread(threadId, (currentThread) => ({
      ...currentThread,
      messagesLoaded: true,
    }))
  }
}

async function selectThread(threadId: string) {
  setSelectedId(threadId)
  await loadThreadMessages(threadId)
}

async function loadHistory() {
  try {
    const response = await chatbotService.sessions(30)
    const remoteThreads = response.sessions.map(mapAgentSession)

    if (remoteThreads.length === 0) {
      if (state.threads.length === 0) {
        const thread = createEmptyThread()
        setState((current) => ({
          ...current,
          threads: [thread],
          selectedId: thread.id,
        }))
      }
      return
    }

    const selectedId = remoteThreads.some(
      (thread) => thread.id === state.selectedId,
    )
      ? state.selectedId
      : remoteThreads[0].id

    setState((current) => ({
      ...current,
      threads: remoteThreads.map((remoteThread) => {
        const existing = current.threads.find(
          (thread) => thread.id === remoteThread.id,
        )
        if (!existing) return remoteThread

        const statusChanged = existing.status !== remoteThread.status
        const shouldReloadMessages =
          existing.messagesLoaded &&
          existing.status === 'running' &&
          remoteThread.status !== 'running'

        return {
          ...remoteThread,
          messages:
            shouldReloadMessages
              ? []
              : ensureProcessingMessage(
                  existing.messages,
                  remoteThread.id,
                  remoteThread.status,
                ),
          messagesLoaded: shouldReloadMessages
            ? false
            : existing.messagesLoaded || statusChanged
              ? existing.messagesLoaded
              : remoteThread.messagesLoaded,
          pendingApproval:
            remoteThread.pendingApproval ?? existing.pendingApproval,
        }
      }),
      selectedId,
      streamingThreadId:
        current.streamingThreadId &&
        remoteThreads.some((thread) => thread.id === current.streamingThreadId)
          ? current.streamingThreadId
          : current.streamingThreadId,
    }))

    await loadThreadMessages(selectedId)
  } catch (error) {
    if (state.threads.length === 0) {
      const thread = createEmptyThread()
      setState((current) => ({
        ...current,
        threads: [thread],
        selectedId: thread.id,
      }))
    }
  }
}

function setSearch(search: string) {
  setState((current) => ({ ...current, search }))
}

function newChat() {
  const thread = createEmptyThread()
  setState((current) => ({
    ...current,
    threads: [thread, ...current.threads],
    selectedId: thread.id,
  }))
}

function setApiKeyConfig(config: ChatbotApiKeyConfig) {
  saveApiKeyConfig(config)
  setState((current) => ({ ...current, apiKeyConfig: config }))
}

function selectedThread() {
  return (
    state.threads.find((thread) => thread.id === state.selectedId) ??
    state.threads[0]
  )
}

async function sendMessage(content: string) {
  const apiKeyConfig = state.apiKeyConfig
  const thread = selectedThread()
  const hasRunningThread = state.threads.some((item) =>
    isRunningStatus(item.status),
  )
  if (!apiKeyConfig || !thread || state.streamingThreadId || hasRunningThread) {
    return false
  }

  const threadId = thread.id
  const requestSessionId = isLocalThreadId(threadId) ? null : threadId
  const sentAt = getCurrentTime()
  const userMessageId = `user_${Date.now()}`
  const assistantMessageId = `assistant_${Date.now()}`
  let activeThreadId = threadId
  let hasToken = false
  let hasStreamError = false
  let rawAssistantContent = ''

  updateThread(threadId, (currentThread) => ({
    ...currentThread,
    status: 'running',
    firstUserMessage: currentThread.firstUserMessage || content,
    updatedAt: sentAt,
    messages: [
      ...currentThread.messages,
      {
        id: userMessageId,
        role: 'user',
        content,
        sentAt,
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        sentAt,
        isStreaming: true,
      },
    ],
  }))

  setState((current) => ({ ...current, streamingThreadId: threadId }))

  try {
    await chatbotService.streamChat(
      {
        message: content,
        session_id: requestSessionId,
        ...buildLlmRequestConfig(apiKeyConfig),
      },
      {
        onEvent: (event) => {
          if (event.type === 'session') {
            replaceThreadId(activeThreadId, event.id)
            activeThreadId = event.id
            return
          }

          if (event.type === 'reason' && !hasToken) {
            updateAssistantMessage(activeThreadId, assistantMessageId, () => '')
          }
        },
        onStatus: () => {
          if (!hasToken) {
            updateAssistantMessage(activeThreadId, assistantMessageId, () => '')
          }
        },
        onTool: () => {
          if (!hasToken) {
            updateAssistantMessage(activeThreadId, assistantMessageId, () => '')
          }
        },
        onUsage: (event: Extract<AgentSseEvent, { type: 'usage' }>) => {
          updateAssistantUsage(activeThreadId, assistantMessageId, {
            inputTokens: event.input_tokens,
            outputTokens: event.output_tokens,
          })
        },
        onToken: (text) => {
          hasToken = true
          rawAssistantContent += text

          updateAssistantSnapshot(activeThreadId, assistantMessageId, {
            content: normalizeApprovalContent(rawAssistantContent),
            pendingApproval: buildPendingApproval(
              rawAssistantContent,
              activeThreadId,
            ),
          })
        },
        onError: (message) => {
          hasStreamError = true
          const errorFeedback = getChatbotErrorFeedback(message)
          updateAssistantSnapshot(activeThreadId, assistantMessageId, {
            content: hasToken ? normalizeApprovalContent(rawAssistantContent) : '',
            errorFeedback,
            isStreaming: false,
          })
          updateThread(activeThreadId, (currentThread) => ({
            ...currentThread,
            status: 'failed',
          }))
        },
        onDone: () => {
          if (!hasToken && !hasStreamError) {
            hasStreamError = true
            updateAssistantSnapshot(activeThreadId, assistantMessageId, {
              content: '',
              errorFeedback: getChatbotErrorFeedback(
                'API key invalid or model unavailable: stream ended without response.',
              ),
              isStreaming: false,
            })
            updateThread(activeThreadId, (currentThread) => ({
              ...currentThread,
              status: 'failed',
            }))
          }
          finishAssistantMessage(activeThreadId, assistantMessageId)
        },
      },
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể kết nối chatbot.'
    updateAssistantSnapshot(activeThreadId, assistantMessageId, {
      content: '',
      errorFeedback: getChatbotErrorFeedback(message),
      isStreaming: false,
    })
    updateThread(activeThreadId, (currentThread) => ({
      ...currentThread,
      status: 'failed',
    }))
  } finally {
    finishAssistantMessage(activeThreadId, assistantMessageId)
    setState((current) => ({
      ...current,
      streamingThreadId:
        current.streamingThreadId === activeThreadId
          ? null
          : current.streamingThreadId,
    }))
    void loadHistory()
  }

  return true
}

async function respondToApproval(
  threadId: string,
  messageId: string,
  approved: boolean,
) {
  const apiKeyConfig = state.apiKeyConfig
  if (!apiKeyConfig) {
    appendAssistantMessage(
      threadId,
      'Bạn cần cấu hình API key cho chat bot trước khi duyệt hoặc từ chối đề xuất cập nhật rule.',
    )
    return false
  }

  const thread = state.threads.find((item) => item.id === threadId)
  const message = thread?.messages.find((item) => item.id === messageId)
  const pendingApproval = message?.pendingApproval

  if (!thread || !message || !pendingApproval) return false
  if (pendingApproval.status !== 'pending') return false

  updateApprovalStatus(
    threadId,
    messageId,
    approved ? 'approving' : 'rejecting',
  )
  updateThread(threadId, (currentThread) => ({
    ...currentThread,
    status: 'running',
  }))

  try {
    const response = approved
      ? await chatbotService.approve({
          session_id: pendingApproval.sessionId,
          ...buildLlmRequestConfig(apiKeyConfig),
        })
      : await chatbotService.reject({
          session_id: pendingApproval.sessionId,
          ...buildLlmRequestConfig(apiKeyConfig),
        })

    updateApprovalStatus(
      threadId,
      messageId,
      approved ? 'approved' : 'rejected',
    )
    updateThread(threadId, (currentThread) => ({
      ...currentThread,
      status: 'active',
      pendingApproval: undefined,
    }))
    appendAssistantMessage(
      threadId,
      response.response || response.message || 'Da xu ly yeu cau.',
    )
  } catch (error) {
    updateApprovalStatus(threadId, messageId, 'pending')
    updateThread(threadId, (currentThread) => ({
      ...currentThread,
      status: 'awaiting_approval',
    }))
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể xử lý yêu cầu phê duyệt.'
    appendAssistantMessage(
      threadId,
      `Không thể xử lý phê duyệt: ${getChatbotErrorFeedback(message).description}`,
    )
  }

  return true
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

export function useChatbotRuntime() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const chatbotRuntimeActions = {
  loadHistory,
  newChat,
  respondToApproval,
  sendMessage,
  setApiKeyConfig,
  setSearch,
  selectThread,
  setSelectedId,
}
