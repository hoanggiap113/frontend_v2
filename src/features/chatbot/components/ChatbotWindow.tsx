import { useEffect, useRef, useState } from 'react'
import { Bot, Gauge, KeyRound, Loader2, Send, Sparkles } from '#/shared/ui/icons'
import ScrollArea from '#/shared/components/ScrollArea'
import { ChatbotMessageBubble } from './ChatbotMessageBubble'
import type { ChatbotApiKeyConfig, ChatbotThread } from './types'

interface ChatbotWindowProps {
  thread: ChatbotThread
  apiKeyConfig: ChatbotApiKeyConfig | null
  usageSummary?: {
    inputTokens: number
    outputTokens: number
  }
  isStreaming?: boolean
  isRequestLocked?: boolean
  onOpenApiKey: () => void
  onApprovalResponse: (
    threadId: string,
    messageId: string,
    approved: boolean,
  ) => void
  onSendMessage: (content: string) => void
}

function normalizeCommand(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getApprovalIntent(value: string): 'approve' | 'reject' | null {
  const command = normalizeCommand(value)
  if (!command) return null

  if (
    ['khong', 'khong dong y', 'tu choi', 'huy', 'cancel', 'reject'].includes(
      command,
    )
  ) {
    return 'reject'
  }

  if (
    [
      'co',
      'dong y',
      'duyet',
      'chap nhan',
      'ok',
      'oke',
      'ok luu',
      'luu',
      'approve',
      'yes',
    ].includes(command)
  ) {
    return 'approve'
  }

  return null
}

export function ChatbotWindow({
  thread,
  apiKeyConfig,
  usageSummary,
  isStreaming = false,
  isRequestLocked = false,
  onOpenApiKey,
  onApprovalResponse,
  onSendMessage,
}: ChatbotWindowProps) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const hasApiKey = Boolean(apiKeyConfig?.apiKey)
  const providerLabel =
    apiKeyConfig?.provider === 'claude' ? 'Claude' : 'Gemini'
  const modelLabel = apiKeyConfig?.model || 'No model selected'
  const totalTokens =
    (usageSummary?.inputTokens ?? 0) + (usageSummary?.outputTokens ?? 0)
  const pendingApprovalMessage = thread.messages.find(
    (message) => message.pendingApproval?.status === 'pending',
  )

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [thread.id, thread.messages.length])

  const handleSubmit = () => {
    const value = draft.trim()
    if (!value || !hasApiKey || isStreaming || isRequestLocked) return

    if (pendingApprovalMessage) {
      const approvalIntent = getApprovalIntent(value)
      if (approvalIntent) {
        onApprovalResponse(
          thread.id,
          pendingApprovalMessage.id,
          approvalIntent === 'approve',
        )
        setDraft('')
        return
      }
    }

    onSendMessage(value)
    setDraft('')
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white via-emerald-50/50 to-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
            <Bot size={21} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-slate-800">
                {thread.botName}
              </h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Chatbot
              </span>
              {isStreaming ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-100">
                  <Loader2 className="animate-spin" size={11} />
                  Working
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-slate-400">
              {thread.firstUserMessage ||
                'Bắt đầu bằng câu hỏi đầu tiên của bạn'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {hasApiKey ? (
            <div className="hidden px-3 py-2 text-right lg:block">
              <div className="max-w-48 truncate text-xs font-semibold text-slate-700">
                {providerLabel} / {modelLabel}
              </div>
            </div>
          ) : null}
          {totalTokens > 0 ? (
            <div className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                aria-label="Show token usage"
              >
                <Gauge size={15} />
                Usage
              </button>
              <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-emerald-100 bg-white p-3 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Total tokens used
                </div>
                <div className="mt-1 text-xl font-bold text-emerald-700">
                  {totalTokens.toLocaleString()}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Input
                    </div>
                    <div className="mt-1 font-semibold text-slate-700">
                      {(usageSummary?.inputTokens ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Output
                    </div>
                    <div className="mt-1 font-semibold text-slate-700">
                      {(usageSummary?.outputTokens ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <button
            onClick={onOpenApiKey}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              hasApiKey
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <KeyRound size={15} />
            {hasApiKey ? providerLabel : 'Thêm API key'}
          </button>
        </div>
      </div>

      <div className="flex h-[640px] min-h-0 flex-col bg-gradient-to-b from-slate-50/90 to-white">
        <ScrollArea
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-5 px-5 py-6"
        >
          {thread.messages.length > 0 ? (
            thread.messages.map((message) => (
              <ChatbotMessageBubble
                key={message.id}
                message={message}
                onApprove={() =>
                  onApprovalResponse(thread.id, message.id, true)
                }
                onReject={() =>
                  onApprovalResponse(thread.id, message.id, false)
                }
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Sparkles size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">
                  Bạn muốn hỏi CQA Agent điều gì?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Gửi câu hỏi đầu tiên để tạo lịch sử chat. Nội dung này sẽ được
                  dùng làm mô tả ngắn cho đoạn chat ở cột bên trái.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          {!hasApiKey ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <span>
                Chatbot cần API key Gemini hoặc Claude để tạo câu trả lời.
              </span>
              <button
                onClick={onOpenApiKey}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                Thêm API key
              </button>
            </div>
          ) : null}

          {pendingApprovalMessage ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
              Đang có đề xuất cập nhật rule chờ duyệt. Bạn có thể bấm nút trong
              thẻ phê duyệt, hoặc gõ <strong>Đồng ý</strong> /{' '}
              <strong>Từ chối</strong> tại ô chat này.
            </div>
          ) : null}

          {isRequestLocked && !isStreaming ? (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-800">
              CQA Agent đang xử lý một câu hỏi khác. Bạn có thể mở đoạn chat
              đang có nhãn <strong>Đang trả lời</strong> để xem tiến trình.
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-emerald-200 focus-within:ring-4 focus-within:ring-emerald-50">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={isStreaming || isRequestLocked}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSubmit()
                }
              }}
              rows={3}
              placeholder="Nhập tin nhắn cho chatbot..."
              className="max-h-32 min-h-16 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <div className="text-xs text-slate-400">
                {hasApiKey
                  ? isStreaming || isRequestLocked
                    ? 'Agent đang xử lý yêu cầu hiện tại'
                    : 'Enter để gửi, Shift + Enter để xuống dòng'
                  : 'Thêm API key trước khi gửi tin nhắn'}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!draft.trim() || !hasApiKey || isStreaming || isRequestLocked}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white hover:from-emerald-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300"
              >
                <Send size={14} />
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
