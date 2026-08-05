import {
  AlertTriangle,
  Bot,
  Check,
  Clock3,
  FileText,
  Loader2,
  ShieldCheck,
  UserRound,
  X,
} from '#/shared/ui/icons'
import type { ChatbotMessage } from './types'

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage
  onApprove?: () => void
  onReject?: () => void
}

export function ChatbotMessageBubble({
  message,
  onApprove,
  onReject,
}: ChatbotMessageBubbleProps) {
  const isUser = message.role === 'user'
  const approvalStatus = message.pendingApproval?.status
  const approvalAction = message.pendingApproval?.action
  const hasContent = message.content.trim().length > 0
  const isTypingOnly =
    !isUser && Boolean(message.isStreaming) && !hasContent && !message.errorFeedback
  const canRespondToApproval =
    approvalStatus === 'pending' && !message.isStreaming
  const isProcessingApproval =
    approvalStatus === 'approving' || approvalStatus === 'rejecting'
  const rulesConfigText = formatRulesConfig(approvalAction?.rulesConfig)

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
          <Bot size={17} />
        </div>
      ) : null}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
            : 'border border-slate-200 bg-white text-slate-700'
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold opacity-80">
          <span>{isUser ? 'Ban' : 'CQA Agent'}</span>
          <span className="opacity-60">/</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} />
            {message.sentAt}
          </span>
        </div>

        {isTypingOnly ? (
            <TypingWave />
        ) : hasContent || message.isStreaming ? (
          <div className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.content}
            {message.isStreaming ? (
              <span className="ml-2 inline-flex text-emerald-600">
                <TypingWave />
              </span>
            ) : null}
          </div>
        ) : null}

        {!isUser && message.errorFeedback ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 text-rose-950">
            <div className="flex items-start gap-3 border-b border-rose-100 bg-white/70 px-4 py-3">
              <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold">
                  {message.errorFeedback.title}
                </div>
                <div className="mt-1 text-xs leading-5 text-rose-700">
                  {message.errorFeedback.description}
                </div>
              </div>
            </div>
            <div className="space-y-2 px-4 py-3">
              {message.errorFeedback.suggestions.map((item) => (
                <div
                  key={item}
                  className="flex gap-2 text-xs leading-5 text-rose-800"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!isUser && message.pendingApproval ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
            <div className="border-b border-amber-100 bg-white/65 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-amber-900">
                    Cần phê duyệt cập nhật bộ quy tắc
                  </div>
                  <div className="mt-1 text-xs leading-5 text-amber-700">
                    Coaching Agent đã soạn đề xuất thay đổi rule. Hệ thống sẽ
                    chỉ lưu vào database sau khi bạn duyệt.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 px-4 py-3">
              {approvalAction?.title ? (
                <div className="rounded-xl border border-amber-100 bg-white px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-amber-500">
                    Bộ quy tắc đề xuất
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-800">
                    {approvalAction.title}
                  </div>
                  {approvalAction.description ? (
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {approvalAction.description}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {approvalAction?.rulesContent ? (
                <details className="group rounded-xl border border-amber-100 bg-white">
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-bold text-amber-700">
                    <FileText size={14} />
                    Xem nội dung rule sẽ được lưu
                    <span className="ml-auto text-[10px] font-semibold text-amber-500 group-open:hidden">
                      Mở
                    </span>
                    <span className="ml-auto hidden text-[10px] font-semibold text-amber-500 group-open:inline">
                      Đóng
                    </span>
                  </summary>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-amber-100 px-3 py-3 text-xs leading-5 text-slate-600">
                    {approvalAction.rulesContent}
                  </pre>
                </details>
              ) : null}

              {rulesConfigText ? (
                <details className="group rounded-xl border border-sky-100 bg-white">
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-bold text-sky-700">
                    <FileText size={14} />
                    Xem cấu hình rule_config sẽ được lưu
                    <span className="ml-auto text-[10px] font-semibold text-sky-500 group-open:hidden">
                      Mở
                    </span>
                    <span className="ml-auto hidden text-[10px] font-semibold text-sky-500 group-open:inline">
                      Đóng
                    </span>
                  </summary>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-sky-100 px-3 py-3 text-xs leading-5 text-slate-600">
                    {rulesConfigText}
                  </pre>
                </details>
              ) : null}

              {approvalStatus === 'approved' ? (
                <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <Check size={13} />
                  Đã duyệt
                </div>
              ) : approvalStatus === 'rejected' ? (
                <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  <X size={13} />
                  Đã từ chối
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={!canRespondToApproval || isProcessingApproval}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {approvalStatus === 'approving' ? (
                      <Loader2 className="animate-spin" size={13} />
                    ) : (
                      <Check size={13} />
                    )}
                    Duyệt & lưu
                  </button>
                  <button
                    type="button"
                    onClick={onReject}
                    disabled={!canRespondToApproval || isProcessingApproval}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                  >
                    {approvalStatus === 'rejecting' ? (
                      <Loader2 className="animate-spin" size={13} />
                    ) : (
                      <X size={13} />
                    )}
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!isUser && message.usage ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-400">
            <span className="rounded-full bg-slate-50 px-2 py-1">
              Input: {message.usage.inputTokens.toLocaleString()} tokens
            </span>
            <span className="rounded-full bg-slate-50 px-2 py-1">
              Output: {message.usage.outputTokens.toLocaleString()} tokens
            </span>
          </div>
        ) : null}
      </div>

      {isUser ? (
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <UserRound size={17} />
        </div>
      ) : null}
    </div>
  )
}

function formatRulesConfig(value: unknown) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function TypingWave() {
  return (
    <span
      className="inline-flex h-5 items-center gap-1 align-middle text-emerald-500"
      aria-label="Đang trả lời"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-2 rounded-full bg-current opacity-70 [animation:chat-wave_0.9s_ease-in-out_infinite]"
          style={{ animationDelay: `${index * 0.14}s` }}
        />
      ))}
      <style>{`
        @keyframes chat-wave {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-0.35rem);
            opacity: 1;
          }
        }
      `}</style>
    </span>
  )
}
