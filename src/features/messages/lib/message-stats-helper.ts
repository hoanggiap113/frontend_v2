import { formatNumber } from '#/shared/lib/number-helper'
import type { ConversationItem } from '../types/message'

export type MessageStatIconKey = 'activity' | 'bot' | 'message' | 'paperclip'
export type MessageStatTone = 'emerald' | 'indigo' | 'slate'

export interface MessageStatItem {
  label: string
  value: string
  note: string
  iconKey: MessageStatIconKey
  tone: MessageStatTone
}

export function buildBusinessMessageStats(
  conversations: ConversationItem[],
): MessageStatItem[] {
  const totalMessages = conversations.reduce(
    (sum, conversation) => sum + conversation.messages.length,
    0,
  )
  const attachmentMessages = conversations.reduce(
    (sum, conversation) =>
      sum +
      conversation.messages.filter(
        (message) => (message.attachments?.length ?? 0) > 0,
      ).length,
    0,
  )
  const evaluatedConversations = conversations.filter(
    (conversation) =>
      conversation.aiVerdict !== 'unknown' ||
      Boolean(conversation.insights?.qc) ||
      Boolean(conversation.insights?.classification),
  ).length
  const activeConversations = conversations.filter(
    (conversation) => conversation.status !== 'resolved',
  ).length

  return [
    {
      label: 'Hội thoại',
      value: formatNumber(conversations.length),
      note: `${formatNumber(activeConversations)} chưa hoàn tất`,
      iconKey: 'message',
      tone: 'emerald',
    },
    {
      label: 'Tin nhắn',
      value: formatNumber(totalMessages),
      note: 'Đã đồng bộ từ kênh',
      iconKey: 'activity',
      tone: 'indigo',
    },
    {
      label: 'Ảnh & tệp',
      value: formatNumber(attachmentMessages),
      note: 'Tin nhắn có đính kèm',
      iconKey: 'paperclip',
      tone: 'slate',
    },
    {
      label: 'Đánh giá AI',
      value: formatNumber(evaluatedConversations),
      note: 'Hội thoại đã có kết quả',
      iconKey: 'bot',
      tone: 'emerald',
    },
  ]
}
