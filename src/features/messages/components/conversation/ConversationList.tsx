import { Check, ChevronDown, Search, SlidersHorizontal } from '#/components/ui/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import ScrollArea from '#/components/ui/ScrollArea'
import type { MessageChannelFilter, MessageChannelOption } from '../../../../lib/helpers/message-helper'
import type { ConversationItem } from '../../../../lib/types/message'

interface ConversationListProps {
  channel: MessageChannelFilter
  channelOptions: MessageChannelOption[]
  conversations: ConversationItem[]
  localSearch: string
  selectedId?: string
  onChannelChange: (channel: MessageChannelFilter) => void
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
}

export function ConversationList({
  channel,
  channelOptions,
  conversations,
  localSearch,
  selectedId,
  onChannelChange,
  onSearchChange,
  onSelect,
}: ConversationListProps) {
  const [channelPickerOpen, setChannelPickerOpen] = useState(false)
  const [channelSearch, setChannelSearch] = useState('')
  const channelPickerRef = useRef<HTMLDivElement>(null)

  const selectedChannel =
    channelOptions.find((item) => item.value === channel) ?? channelOptions[0]

  const visibleChannelOptions = useMemo(() => {
    const query = channelSearch.trim().toLowerCase()

    if (!query) return channelOptions

    return channelOptions.filter((item) =>
      `${item.label} ${item.value}`.toLowerCase().includes(query),
    )
  }, [channelOptions, channelSearch])

  useEffect(() => {
    if (!channelPickerOpen) return

    function handleDocumentPointerDown(event: MouseEvent) {
      if (
        channelPickerRef.current &&
        !channelPickerRef.current.contains(event.target as Node)
      ) {
        setChannelPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown)
    }
  }, [channelPickerOpen])

  function handleChannelSelect(value: MessageChannelFilter) {
    onChannelChange(value)
    setChannelSearch('')
    setChannelPickerOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)] xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start">
      <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search size={14} className="text-emerald-500" />
          <input
            value={localSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo khách hàng, tag hoặc nội dung..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <div ref={channelPickerRef} className="relative mt-3">
          <button
            type="button"
            onClick={() => setChannelPickerOpen((open) => !open)}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <SlidersHorizontal size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase text-slate-400">
                Kênh
              </span>
              <span className="block truncate text-sm font-semibold text-slate-800">
                {selectedChannel?.label ?? 'Tất cả kênh'}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-400 transition ${
                channelPickerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {channelPickerOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
              <div className="border-b border-slate-100 p-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                  <Search size={14} className="shrink-0 text-slate-400" />
                  <input
                    value={channelSearch}
                    onChange={(event) => setChannelSearch(event.target.value)}
                    placeholder="Tìm kênh..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5">
                {visibleChannelOptions.length > 0 ? (
                  visibleChannelOptions.map((item) => {
                    const active = item.value === channel

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleChannelSelect(item.value)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                          active
                            ? 'bg-emerald-50 font-semibold text-emerald-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        {active && (
                          <Check
                            size={15}
                            className="shrink-0 text-emerald-600"
                          />
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-slate-400">
                    Không tìm thấy kênh phù hợp
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-[380px] sm:max-h-[480px] xl:max-h-[calc(100vh-11rem)]">
        {conversations.map((item) => {
          const active = selectedId === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                active
                  ? 'bg-emerald-50/80 shadow-[inset_3px_0_0_#10b981]'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-semibold text-slate-800">
                      {item.customerName}
                    </div>
                    {item.priority === 'vip' && (
                      <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700">
                        VIP
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-slate-400">
                  {item.lastMessageAt}
                </div>
              </div>
              <div className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                {item.lastMessage}
              </div>
            </button>
          )
        })}
      </ScrollArea>
    </div>
  )
}
