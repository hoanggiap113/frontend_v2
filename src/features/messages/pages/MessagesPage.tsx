import { useEffect, useMemo, useState } from 'react'
import { PageContainer, PageHeader } from '#/shared/ui/index'
import {
  ConversationList,
  ConversationOverview,
  ConversationTranscript,
  MessageStatsCards,
  SyncScoringNotice,
} from '../components'
import {
  filterConversations,
  type MessageChannelFilter,
} from '../lib/message-helper'
import { formatNumber } from '#/shared/lib/number-helper'
import { useChannelsQuery } from '#/features/channels'
import { useConversationsQuery } from '../service/messages.queries'
import { selectCurrentWorkspaceId, selectGlobalSearch } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'

export default function MessagesPage() {
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const globalSearch = useAppSelector(selectGlobalSearch)

  const [selectedId, setSelectedId] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [channel, setChannel] = useState<MessageChannelFilter>('all')
  const selectedChannelId = channel === 'all' ? undefined : channel
  const { data: channels = [] } = useChannelsQuery(workspaceId)
  const { data: allConversations = [] } = useConversationsQuery(workspaceId, {
    channelId: selectedChannelId,
  })

  const channelOptions = useMemo(
    () => [
      { value: 'all', label: 'Tất cả kênh' },
      ...channels.map((item) => ({ value: item.id, label: item.name })),
    ],
    [channels],
  )

  useEffect(() => {
    if (channel === 'all') return
    if (channels.some((item) => item.id === channel)) return
    setChannel('all')
  }, [channel, channels])

  const conversations = useMemo(() => {
    return filterConversations({
      conversations: allConversations,
      globalSearch,
      localSearch,
    })
  }, [allConversations, globalSearch, localSearch])
  const selectedConversation =
    conversations.find((item) => item.id === selectedId) ?? conversations[0]

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Message Center"
        title="Quản lý hội thoại khách hàng"
        description="Theo dõi hội thoại đã đồng bộ, kiểm tra phân loại và xem nhanh dữ liệu tệp đính kèm trong từng tin nhắn."
        extra={
          <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {formatNumber(conversations.length)} hội thoại đang hiển thị
          </span>
        }
      />

      <div className="space-y-6">
        <SyncScoringNotice />

        <MessageStatsCards conversations={allConversations} />

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
          <ConversationList
            channel={channel}
            channelOptions={channelOptions}
            conversations={conversations}
            localSearch={localSearch}
            selectedId={selectedConversation?.id}
            onChannelChange={setChannel}
            onSearchChange={setLocalSearch}
            onSelect={setSelectedId}
          />

          {selectedConversation ? (
            <div className="space-y-5">
              <ConversationOverview conversation={selectedConversation} />
              <ConversationTranscript conversation={selectedConversation} />
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              Không có hội thoại nào khả dụng.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
