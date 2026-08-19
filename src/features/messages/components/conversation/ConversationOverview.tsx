import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  Tag,
  UserRound,
} from '#/components/ui/icons'
import {
  AI_VERDICT_META,
  getConversationStatusMeta,
} from '../../../../lib/helpers/message-helper'
import type { ConversationItem } from '../../../../lib/types/message'

interface ConversationOverviewProps {
  conversation: ConversationItem
}

export function ConversationOverview({
  conversation,
}: ConversationOverviewProps) {
  const statusMeta = getConversationStatusMeta(conversation.status)
  const verdictMeta = AI_VERDICT_META[conversation.aiVerdict]
  const qc = conversation.insights?.qc
  const classification = conversation.insights?.classification
  const hasAiEvaluation =
    conversation.aiVerdict !== 'unknown' || Boolean(qc) || Boolean(classification)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-5 border-b border-slate-100 px-4 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Khách hàng
          </div>
          <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {conversation.customerName}
          </h2>
          <div className="mt-1 truncate text-sm font-medium text-slate-400">
            Mã/handle: {conversation.customerHandle}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <OverviewPill
            label="Trạng thái"
            value={statusMeta.label}
            className={statusMeta.className}
          />
          <OverviewPill
            label="Đánh giá AI"
            value={verdictMeta.label}
            className={verdictMeta.className}
          />
        </div>
      </div>

      <div className="grid gap-5 bg-slate-50/60 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Tóm tắt hội thoại
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Nội dung cô đọng từ kết quả QC hoặc phân loại gần nhất.
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Bot size={18} />
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
            {conversation.summary}
          </p>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <UserRound size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Người phụ trách
                </div>
                <div className="mt-1 truncate text-sm font-bold text-slate-800">
                  {conversation.assignee}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Phân loại
              </div>
              <Tag size={15} className="text-slate-400" />
            </div>
            {conversation.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {conversation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">Chưa có tag</div>
            )}
            {classification?.reason ? (
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                {classification.reason}
              </p>
            ) : null}
          </article>
        </div>

        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                AI insights
              </div>
            </div>
            {!qc || qc.passed === null ? (
              <Bot size={18} className="text-slate-400" />
            ) : qc.passed === false ? (
              <AlertTriangle size={18} className="text-rose-500" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-500" />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="QC score"
              value={formatScore(qc?.overallScore)}
            />
            <MetricCard label="Severity" value={qc?.severity ?? 'Chưa có'} />
            <MetricCard
              label="Confidence"
              value={formatConfidence(qc?.confidence)}
            />
            <MetricCard
              label="Classification"
              value={classification?.label ?? 'Chưa có'}
            />
          </div>

          {!hasAiEvaluation ? (
            <div className="mt-4 flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-800">
              <Clock3
                size={18}
                className="mt-0.5 shrink-0 text-indigo-600"
              />
              <div>
                <span className="font-bold">Chưa có đánh giá AI.</span> Nếu
                hội thoại vừa được đồng bộ, hệ thống cần thêm thời gian để job
                QC/phân loại xử lý và cập nhật kết quả.
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  )
}

function OverviewPill({
  className,
  label,
  value,
}: {
  className: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div
        className={`mt-2 rounded-full px-3 py-1 text-center text-xs font-bold ${className}`}
      >
        {value}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-extrabold text-slate-900">
        {value}
      </div>
    </div>
  )
}

function formatScore(score?: number | null) {
  if (typeof score !== 'number') return 'Chưa có'
  return `${Number.isInteger(score) ? score : score.toFixed(1)}/10`
}

function formatConfidence(confidence?: number | null) {
  if (typeof confidence !== 'number') return 'Chưa có'
  const normalized = confidence > 1 ? confidence : confidence * 100
  return `${Math.round(normalized)}%`
}
