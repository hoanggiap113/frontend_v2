export type ChatbotMessageRole = 'user' | 'assistant'

export type ChatbotLlmProvider = 'gemini' | 'claude'
export type ChatbotThreadStatus =
  | 'active'
  | 'running'
  | 'failed'
  | 'awaiting_approval'
  | string

export type ChatbotApprovalStatus =
  | 'pending'
  | 'approving'
  | 'rejecting'
  | 'approved'
  | 'rejected'

export interface ChatbotApprovalAction {
  toolName?: string
  jobId?: string
  title?: string
  description?: string
  rulesContent?: string
  rulesConfig?: unknown
}

export interface ChatbotPendingApproval {
  sessionId: string
  status: ChatbotApprovalStatus
  action?: ChatbotApprovalAction
}

export interface ChatbotApiKeyConfig {
  provider: ChatbotLlmProvider
  model: string
  apiKey: string
  anthropicBaseUrl?: string
  anthropicAuthToken?: string
}

export interface ChatbotMessage {
  id: string
  role: ChatbotMessageRole
  content: string
  sentAt: string
  isStreaming?: boolean
  errorFeedback?: ChatbotErrorFeedback
  pendingApproval?: ChatbotPendingApproval
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export interface ChatbotErrorFeedback {
  title: string
  description: string
  suggestions: string[]
}

export interface ChatbotThread {
  id: string
  botName: string
  firstUserMessage: string
  lastMessagePreview?: string | null
  updatedAt: string
  status?: ChatbotThreadStatus | null
  messages: ChatbotMessage[]
  pendingApproval?: ChatbotPendingApproval
  messagesLoaded?: boolean
}

export type AgentModelCatalog = Record<
  ChatbotLlmProvider,
  Record<string, string>
>

export interface AgentChatRequest {
  message: string
  session_id?: string | null
  llm_provider: ChatbotLlmProvider
  model_name?: string | null
  api_key: string
  anthropic_base_url?: string | null
  anthropic_auth_token?: string | null
}

export type AgentSseEvent =
  | {
      type: 'session'
      id: string
    }
  | {
      type: 'status'
      agent: string
      text: string
    }
  | {
      type: 'reason'
      text: string
    }
  | {
      type: 'token'
      text: string
    }
  | {
      type: 'tool'
      name: string
      input?: unknown
      output?: string | null
    }
  | {
      type: 'usage'
      input_tokens: number
      output_tokens: number
    }
  | {
      type: 'error'
      text: string
    }
  | {
      type: 'done'
    }

export interface AgentTestKeyRequest {
  llm_provider: ChatbotLlmProvider
  model_name?: string | null
  api_key: string
  anthropic_base_url?: string | null
  anthropic_auth_token?: string | null
}

export interface AgentTestKeyResponse {
  status: 'success' | 'error'
  message: string
}

export interface AgentApproveRequest {
  session_id: string
  llm_provider: ChatbotLlmProvider
  model_name?: string | null
  api_key: string
  anthropic_base_url?: string | null
  anthropic_auth_token?: string | null
}

export interface AgentActionResponse {
  status: string
  message: string
  response?: string
}

export interface AgentSessionSummary {
  id: string
  thread_id: string
  title?: string | null
  status?: string | null
  last_message_preview?: string | null
  last_activity_at?: string | null
  total_input_tokens?: number | null
  total_output_tokens?: number | null
  pending_action?: unknown
  created_at?: string | null
  updated_at?: string | null
}

export interface AgentSessionsResponse {
  sessions: AgentSessionSummary[]
  message?: string
}

export interface AgentSessionMessage {
  id: string
  role: string
  content: string
  tool_name?: string | null
  input_tokens?: number | null
  output_tokens?: number | null
  created_at?: string | null
}

export interface AgentSessionMessagesResponse {
  messages: AgentSessionMessage[]
  message?: string
}
