import { useEffect, useRef } from 'react'
import { MessageCircle } from '#/shared/ui/icons'
import ScrollArea from '#/shared/components/ScrollArea'
import type { ConversationItem } from '../../types/message'
import { MessageBubble } from './MessageBubble'

interface ConversationTranscriptProps {
  conversation: ConversationItem
}

export function ConversationTranscript({
  conversation,
}: ConversationTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [conversation.id])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-slate-800">
              Nội dung hội thoại
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {conversation.messages.length} tin nhắn trong cuộc hội thoại này
          </p>
        </div>
      </div>

      <div className="flex h-[min(68vh,560px)] min-h-[420px] flex-col bg-slate-100/60">
        <ScrollArea
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-4 px-3 py-4 sm:px-5 sm:py-5"
        >
          {conversation.messages.length > 0 ? (
            conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              Hội thoại này chưa có tin nhắn.
            </div>
          )}
        </ScrollArea>

       
      </div>
    </div>
  )
}
