import { Bot, Clock, Loader2, Plus, Search, ShieldCheck } from '#/components/ui/icons'
import ScrollArea from '#/components/ui/ScrollArea'
import type { ChatbotThread } from './types'

interface ChatbotHistoryProps {
  threads: ChatbotThread[]
  selectedId: string
  search: string
  onSearchChange: (value: string) => void
  onNewChat: () => void
  onSelect: (id: string) => void
}

export function ChatbotHistory({
  threads,
  selectedId,
  search,
  onSearchChange,
  onNewChat,
  onSelect,
}: ChatbotHistoryProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <button
          onClick={onNewChat}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <Plus size={15} />
          Đoạn chat mới
        </button>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm lịch sử chat..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <ScrollArea className="max-h-[720px]">
        {threads.length > 0 ? (
          threads.map((thread) => {
            const active = selectedId === thread.id

            return (
              <button
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={`w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                  active ? 'bg-emerald-50/60' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Bot size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold text-slate-800">
                        {thread.botName}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={11} />
                        {thread.updatedAt}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                      {thread.firstUserMessage || 'Chưa có nội dung đầu tiên'}
                    </div>
                    {thread.pendingApproval?.status === 'pending' ? (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                        <ShieldCheck size={12} />
                        Chờ duyệt cập nhật rule
                      </div>
                    ) : null}
                    {thread.status === 'running' ? (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                        <Loader2 className="animate-spin" size={12} />
                        Đang trả lời
                      </div>
                    ) : null}
                    {thread.status === 'failed' ? (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700">
                        Cần thử lại
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Không tìm thấy đoạn chat phù hợp.
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
