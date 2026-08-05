import type { ConversationItem, ConversationStatus } from '../types/message'

export interface MessageChannelOption {
  value: string
  label: string
}

export type MessageChannelFilter = string

export const CONVERSATION_STATUS_META = {
  pending: {
    label: 'Chưa có',
    className: 'bg-slate-50 text-slate-500 border border-slate-200',
  },
  in_progress: {
    label: 'Cần xử lý',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  waiting_customer: {
    label: 'Chờ khách',
    className: 'bg-violet-50 text-violet-700 border border-violet-200',
  },
  resolved: {
    label: 'Hoàn tất',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
} as const

export const EMPTY_CONVERSATION_STATUS_META = {
  label: 'Chưa có',
  className: 'bg-slate-50 text-slate-500 border border-slate-200',
} as const

export function getConversationStatusMeta(
  status: ConversationItem['status'] | string | null | undefined,
) {
  if (status && status in CONVERSATION_STATUS_META) {
    return CONVERSATION_STATUS_META[status as ConversationStatus]
  }

  return EMPTY_CONVERSATION_STATUS_META
}

export const AI_VERDICT_META = {
  unknown: { label: 'Chưa', className: 'bg-slate-50 text-slate-500' },
  pass: { label: 'Đạt', className: 'bg-emerald-50 text-emerald-700' },
  warning: { label: 'Cần theo dõi', className: 'bg-amber-50 text-amber-700' },
  failed: { label: 'Có rủi ro', className: 'bg-rose-50 text-rose-700' },
} as const

export function filterConversations({
  conversations,
  globalSearch,
  localSearch,
}: {
  conversations: ConversationItem[]
  globalSearch: string
  localSearch: string
}) {
  const query = `${localSearch} ${globalSearch}`.trim().toLowerCase()

  return conversations.filter((item) => {
    const matchQuery =
      query.length === 0 ||
      item.customerName.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.tags.join(' ').toLowerCase().includes(query)

    return matchQuery
  })
}
