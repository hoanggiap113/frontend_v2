import type { PageResponse } from '#/lib/types/api'

export type ConversationChannel = 'facebook' | 'zalo_oa' | 'pancake'

export type ConversationStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'

export type ConversationAiVerdict = 'unknown' | 'pass' | 'warning' | 'failed'

export type ConversationPriority = 'normal' | 'high' | 'vip'

export type ConversationSender = 'customer' | 'agent' | 'system'

export type ConversationAttachmentKind = 'image' | 'file'

export interface ConversationAttachment {
  id: string
  kind: ConversationAttachmentKind
  name: string
  url: string
  thumbnailUrl?: string
  mimeType?: string
  size?: number
}

export interface ConversationMessage {
  id: string
  sender: ConversationSender
  senderName: string
  time: string
  content: string
  contentType?: string | null
  attachments?: ConversationAttachment[]
}

export interface ConversationItem {
  id: string
  customerName: string
  customerHandle: string
  channel: ConversationChannel
  assignee: string
  status: ConversationStatus | null
  aiVerdict: ConversationAiVerdict
  summary: string
  lastMessage: string
  lastMessageAt: string
  tags: string[]
  score: number
  priority: ConversationPriority
  messages: ConversationMessage[]
  insights?: ConversationInsightsResponse | null
}

export interface ConversationResponse {
  id: string
  channelId: string
  externalConversationId: string
  externalUserId: string
  customerName: string | null
  lastMessageAt: string | null
  messageCount: number
  createdAt: string
  updatedAt: string | null
}

export interface MessageResponse {
  id: string
  conversationId: string
  externalMessageId: string | null
  senderType: string | null
  senderName: string | null
  senderExternalId: string | null
  agentId: string | null
  agentName: string | null
  content: string | null
  contentType: string | null
  attachments: string | null
  sentAt: string | null
  createdAt: string
}

export interface ConversationQcInsight {
  jobResultId: string
  jobRunId: string
  jobId: string
  jobName: string | null
  overallScore: number | null
  passed: boolean | null
  severity: string | null
  summary: string | null
  confidence: number | null
  createdAt: string
}

export interface ConversationClassificationInsight {
  jobResultId: string
  jobRunId: string
  jobId: string
  jobName: string | null
  label: string | null
  confidence: number | null
  summary: string | null
  reason: string | null
  matchedRule: string | null
  createdAt: string
}

export interface ConversationInsightsResponse {
  conversationId: string
  status: string | null
  qc: ConversationQcInsight | null
  classification: ConversationClassificationInsight | null
}

export interface ConversationResponsibleAgent {
  agentId: string | null
  agentName: string | null
  agentExternalId: string | null
  agentEmail: string | null
  senderName: string | null
  senderExternalId: string | null
  messageCount: number
  firstMessageAt: string | null
  lastMessageAt: string | null
  identified: boolean
}

export interface ConversationResponsibleResponse {
  conversationId: string
  responsibles: ConversationResponsibleAgent[]
}

export type ConversationPageResponse = PageResponse<ConversationResponse>

export type MessagePageResponse = PageResponse<MessageResponse>

export interface ConversationListParams {
  channelId?: string
  page?: number
  size?: number
}

export interface MessageListParams {
  channelId?: string
  page?: number
  size?: number
}
