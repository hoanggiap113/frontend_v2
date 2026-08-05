import { isMockMode } from '#/shared/config/env'
import { mockConversations } from '../data/mock_data'
import { endpoints } from '#/shared/service/endpoints'
import { httpClient } from '#/shared/service/http/client'
import { channelsService } from '#/features/channels'
import { clone, mockDelay } from '#/shared/service/utils'
import type { PageResponse } from '#/shared/types/api'
import type { Channel } from '#/features/channels'
import type {
  ConversationChannel,
  ConversationAiVerdict,
  ConversationInsightsResponse,
  ConversationItem,
  ConversationListParams,
  ConversationMessage,
  ConversationPageResponse,
  ConversationResponse,
  ConversationStatus,
  ConversationResponsibleResponse,
  ConversationSender,
  ConversationAttachment,
  ConversationAttachmentKind,
  MessageListParams,
  MessagePageResponse,
  MessageResponse,
} from '../types/message'

let conversationState = clone(mockConversations)

function formatTime(value: string | null | undefined) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toSender(senderType: string | null | undefined): ConversationSender {
  const normalizedType = senderType?.toUpperCase() ?? ''

  if (normalizedType.includes('AGENT')) return 'agent'
  if (normalizedType.includes('SYSTEM')) return 'system'

  return 'customer'
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function parseAttachmentPayload(value: string | null | undefined): unknown[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object') return [parsed]
  } catch {
    return []
  }

  return []
}

function getAttachmentUrl(attachment: Record<string, unknown>) {
  return (
    asString(attachment.url) ||
    asString(attachment.file_url) ||
    asString(attachment.fileUrl) ||
    asString(attachment.attachment_url) ||
    asString(attachment.attachmentUrl) ||
    asString(attachment.image_url) ||
    asString(attachment.imageUrl) ||
    asString(attachment.src) ||
    asString(attachment.href)
  )
}

function getThumbnailUrl(attachment: Record<string, unknown>) {
  return (
    asString(attachment.thumbnail_url) ||
    asString(attachment.thumbnailUrl) ||
    asString(attachment.preview_url) ||
    asString(attachment.previewUrl) ||
    asString(attachment.image_url) ||
    asString(attachment.imageUrl)
  )
}

function getAttachmentKind(
  attachment: Record<string, unknown>,
  url: string,
): ConversationAttachmentKind {
  const rawType = [
    attachment.type,
    attachment.content_type,
    attachment.contentType,
    attachment.mime_type,
    attachment.mimeType,
  ]
    .map(asString)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    rawType.includes('image') ||
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url)
  ) {
    return 'image'
  }

  return 'file'
}

function getAttachmentName(
  attachment: Record<string, unknown>,
  url: string,
  index: number,
) {
  const explicitName =
    asString(attachment.name) ||
    asString(attachment.file_name) ||
    asString(attachment.fileName) ||
    asString(attachment.filename) ||
    asString(attachment.title)

  if (explicitName) return explicitName

  try {
    const pathname = new URL(url).pathname
    const filename = pathname.split('/').filter(Boolean).at(-1)
    if (filename) return decodeURIComponent(filename)
  } catch {}

  return `Tệp đính kèm ${index + 1}`
}

function toAttachments(value: string | null | undefined): ConversationAttachment[] {
  return parseAttachmentPayload(value).flatMap((item, index) => {
    const attachment = asRecord(item)
    if (!attachment) return []

    const url = getAttachmentUrl(attachment)
    if (!url) return []

    return [
      {
        id: asString(attachment.id) || `${index}-${url}`,
        kind: getAttachmentKind(attachment, url),
        name: getAttachmentName(attachment, url, index),
        url,
        thumbnailUrl: getThumbnailUrl(attachment),
        mimeType:
          asString(attachment.mime_type) ||
          asString(attachment.mimeType) ||
          asString(attachment.content_type) ||
          asString(attachment.contentType),
        size: asNumber(attachment.size) || asNumber(attachment.file_size),
      },
    ]
  })
}

function getMessageFallback(
  response: MessageResponse,
  attachments: ConversationAttachment[],
) {
  const hasAttachmentPayload = Boolean(response.attachments?.trim())
  const contentType = response.contentType?.toLowerCase() ?? ''

  if (hasAttachmentPayload && attachments.length === 0) {
    return 'Không thể hiển thị định dạng này'
  }

  if (contentType && contentType !== 'text' && attachments.length === 0) {
    return 'Không thể hiển thị định dạng này'
  }

  if (attachments.length === 0) return 'Tin nhắn trống'

  const imageCount = attachments.filter((item) => item.kind === 'image').length
  const fileCount = attachments.length - imageCount

  if (imageCount > 0 && fileCount > 0) {
    return `Đã gửi ${imageCount} ảnh và ${fileCount} tệp`
  }
  if (imageCount > 0) {
    return imageCount === 1 ? 'Đã gửi một ảnh' : `Đã gửi ${imageCount} ảnh`
  }

  return fileCount === 1 ? 'Đã gửi một tệp' : `Đã gửi ${fileCount} tệp`
}

function toMessage(response: MessageResponse): ConversationMessage {
  const sender = toSender(response.senderType)
  const attachments = toAttachments(response.attachments)
  const senderName =
    response.senderName ||
    response.agentName ||
    (sender === 'agent' ? 'Agent' : sender === 'system' ? 'System' : 'Customer')

  return {
    id: response.id,
    sender,
    senderName,
    time: formatTime(response.sentAt ?? response.createdAt),
    content: response.content?.trim() || getMessageFallback(response, attachments),
    contentType: response.contentType,
    attachments,
  }
}

function getChannelType(
  response: ConversationResponse,
  channelMap: Map<string, ConversationChannel>,
): ConversationChannel {
  return channelMap.get(response.channelId) ?? 'facebook'
}

function getCustomerHandle(response: ConversationResponse) {
  if (response.externalUserId) return response.externalUserId
  if (response.externalConversationId) return response.externalConversationId
  return response.id
}

function getLastMessageText(
  response: ConversationResponse,
  messages: ConversationMessage[],
) {
  const lastMessage = messages.at(-1)

  if (lastMessage?.content) return lastMessage.content
  if (response.messageCount > 0) return `${response.messageCount} messages`

  return 'Hoi thoai chua co tin nhan.'
}

function getAssignee(
  messages: ConversationMessage[],
  responsible?: ConversationResponsibleResponse | null,
) {
  const primaryResponsible = responsible?.responsibles?.[0]
  const apiName =
    primaryResponsible?.senderName?.trim() ||
    primaryResponsible?.agentName?.trim()

  if (apiName) return apiName

  const latestAgentMessage = [...messages]
    .reverse()
    .find((message) => message.sender === 'agent' && message.senderName.trim())

  return latestAgentMessage?.senderName ?? 'Chua phan cong'
}

function toAiVerdict(
  insights?: ConversationInsightsResponse | null,
): ConversationAiVerdict {
  const qc = insights?.qc

  if (!qc || qc.passed === null) return 'unknown'
  if (qc.passed === true) return 'pass'
  if (qc.severity === 'HIGH' || qc.severity === 'CRITICAL') return 'failed'

  return 'warning'
}

function toConversationStatus(
  status: string | null | undefined,
): ConversationStatus | null {
  if (
    status === 'pending' ||
    status === 'in_progress' ||
    status === 'waiting_customer' ||
    status === 'resolved'
  ) {
    return status
  }

  return null
}

async function getConversationInsights(
  workspaceId: string,
  conversationId: string,
) {
  try {
    return await httpClient.get<ConversationInsightsResponse>(
      endpoints.conversations.insights(workspaceId, conversationId),
    )
  } catch {
    return null
  }
}

async function getConversationResponsible(
  workspaceId: string,
  conversationId: string,
) {
  try {
    return await httpClient.get<ConversationResponsibleResponse>(
      endpoints.conversations.responsible(workspaceId, conversationId),
    )
  } catch {
    return null
  }
}

function toConversationItem(
  response: ConversationResponse,
  messages: ConversationMessage[],
  channelMap: Map<string, ConversationChannel>,
  insights?: ConversationInsightsResponse | null,
  responsible?: ConversationResponsibleResponse | null,
): ConversationItem {
  const lastMessage = getLastMessageText(response, messages)
  const classificationLabel = insights?.classification?.label?.trim()
  const qcSummary = insights?.qc?.summary?.trim()
  const classificationSummary =
    insights?.classification?.summary?.trim() ||
    insights?.classification?.reason?.trim()

  return {
    id: response.id,
    customerName: response.customerName || 'Khach hang',
    customerHandle: getCustomerHandle(response),
    channel: getChannelType(response, channelMap),
    assignee: getAssignee(messages, responsible),
    status: toConversationStatus(insights?.status),
    aiVerdict: toAiVerdict(insights),
    summary: qcSummary || classificationSummary || lastMessage,
    lastMessage,
    lastMessageAt: formatTime(response.lastMessageAt ?? response.updatedAt),
    tags: classificationLabel ? [classificationLabel] : [],
    score: insights?.qc?.overallScore ?? 0,
    priority: 'normal',
    messages,
    insights,
  }
}

function toPageResponse<T>(
  content: T[],
  params: { page?: number; size?: number } = {},
): PageResponse<T> {
  const page = params.page ?? 0
  const size = params.size ?? content.length

  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages:
      content.length > 0 && size > 0 ? Math.ceil(content.length / size) : 0,
    hasNext: false,
    hasPrevious: page > 0,
  }
}

async function getChannelMap(workspaceId: string) {
  try {
    const channels = await channelsService.list(workspaceId)

    return new Map(
      channels.map((channel: Channel) => [channel.id, channel.type]),
    )
  } catch {
    return new Map<string, ConversationChannel>()
  }
}

async function getConversationMessages(
  workspaceId: string,
  conversationId: string,
  params: MessageListParams = {},
) {
  const channelId =
    params.channelId ??
    (
      await httpClient.get<ConversationResponse>(
        endpoints.conversations.detail(workspaceId, conversationId),
      )
    ).channelId

  const response = await httpClient.get<MessagePageResponse>(
    endpoints.conversations.messages(workspaceId, conversationId, channelId),
    {
      query: {
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    },
  )

  return {
    ...response,
    content: response.content.map(toMessage),
  }
}

export const messagesService = {
  async page(
    workspaceId: string,
    params: ConversationListParams = {},
  ): Promise<PageResponse<ConversationItem>> {
    if (isMockMode()) {
      await mockDelay()
      if (!params.channelId) {
        return toPageResponse(clone(conversationState), params)
      }

      const channel = (await channelsService.list(workspaceId)).find(
        (item) => item.id === params.channelId,
      )
      const conversations = channel
        ? conversationState.filter((item) => item.channel === channel.type)
        : []

      return toPageResponse(clone(conversations), params)
    }

    const [response, channelMap] = await Promise.all([
      httpClient.get<ConversationPageResponse>(
        endpoints.conversations.list(workspaceId),
        {
          query: {
            channelId: params.channelId,
            page: params.page ?? 0,
            size: params.size ?? 20,
          },
        },
      ),
      getChannelMap(workspaceId),
    ])

    const conversations = await Promise.all(
      response.content.map(async (conversation) => {
        const [messages, insights, responsible] = await Promise.all([
          getConversationMessages(workspaceId, conversation.id, {
            channelId: conversation.channelId,
          }),
          getConversationInsights(workspaceId, conversation.id),
          getConversationResponsible(workspaceId, conversation.id),
        ])
        return toConversationItem(
          conversation,
          messages.content,
          channelMap,
          insights,
          responsible,
        )
      }),
    )

    return {
      ...response,
      content: conversations,
    }
  },

  async list(
    workspaceId: string,
    params: ConversationListParams = {},
  ): Promise<ConversationItem[]> {
    const response = await this.page(workspaceId, params)
    return response.content
  },

  async get(
    workspaceId: string,
    conversationId: string,
  ): Promise<ConversationItem | null> {
    if (isMockMode()) {
      await mockDelay()
      return clone(
        conversationState.find((item) => item.id === conversationId) ?? null,
      )
    }

    const conversation = await httpClient.get<ConversationResponse>(
      endpoints.conversations.detail(workspaceId, conversationId),
    )

    const [messages, channelMap, insights, responsible] = await Promise.all([
      getConversationMessages(workspaceId, conversationId, {
        channelId: conversation.channelId,
      }),
      getChannelMap(workspaceId),
      getConversationInsights(workspaceId, conversationId),
      getConversationResponsible(workspaceId, conversationId),
    ])

    return toConversationItem(
      conversation,
      messages.content,
      channelMap,
      insights,
      responsible,
    )
  },

  async remove(workspaceId: string, conversationId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay()
      conversationState = conversationState.filter(
        (item) => item.id !== conversationId,
      )
      return
    }

    await httpClient.delete(
      endpoints.conversations.detail(workspaceId, conversationId),
    )
  },

  async messages(
    workspaceId: string,
    conversationId: string,
    params: MessageListParams = {},
  ): Promise<PageResponse<ConversationMessage>> {
    if (isMockMode()) {
      await mockDelay()
      const conversation = conversationState.find(
        (item) => item.id === conversationId,
      )

      return toPageResponse(clone(conversation?.messages ?? []), params)
    }

    return getConversationMessages(workspaceId, conversationId, params)
  },

  async getMessage(
    workspaceId: string,
    conversationId: string,
    messageId: string,
  ): Promise<ConversationMessage | null> {
    if (isMockMode()) {
      await mockDelay()
      const conversation = conversationState.find(
        (item) => item.id === conversationId,
      )
      return clone(
        conversation?.messages.find((item) => item.id === messageId) ?? null,
      )
    }

    const response = await httpClient.get<MessageResponse>(
      endpoints.conversations.messageDetail(
        workspaceId,
        conversationId,
        messageId,
      ),
    )

    return toMessage(response)
  },

  async removeMessage(
    workspaceId: string,
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    if (isMockMode()) {
      await mockDelay()
      conversationState = conversationState.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.filter(
                (message) => message.id !== messageId,
              ),
            }
          : conversation,
      )
      return
    }

    await httpClient.delete(
      endpoints.conversations.messageDetail(
        workspaceId,
        conversationId,
        messageId,
      ),
    )
  },
}

export type { ConversationItem, ConversationMessage }
