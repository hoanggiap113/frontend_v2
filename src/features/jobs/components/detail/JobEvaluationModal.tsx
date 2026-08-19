import { AlertTriangle, Bot, CheckCircle2, X } from '#/components/ui/icons'
import ScrollArea from '#/components/ui/ScrollArea'
import { formatDateTime } from '#/lib/helpers/datetime-helper'
import type { JobRunItem } from '../../../../lib/types/job'

interface ParsedRunSummary {
  averageScore?: number
  evaluatedConversations?: number
  skippedConversations?: number
  agentScores?: Record<string, number>
}

export default function JobEvaluationModal({
  run,
  onClose,
}: {
  run: JobRunItem
  onClose: () => void
}) {
  const summary = parseRunSummary(run.summary)
  const evaluated =
    summary?.evaluatedConversations ?? run.evaluatedConversations ?? 0
  const skipped = summary?.skippedConversations ?? run.skippedConversations ?? 0
  const total = run.totalConversations ?? evaluated + skipped
  const agentScores = Object.entries(summary?.agentScores ?? {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-evaluation-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Bot size={14} />
              Tổng quan đánh giá AI
            </div>
            <h3
              id="job-evaluation-modal-title"
              className="mt-3 text-lg font-bold text-slate-900"
            >
              Kết quả của lần chạy
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Đóng đánh giá AI"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:grid-cols-4">
          <Metric label="Tổng chat" value={String(total)} />
          <Metric
            label="Đã đánh giá"
            value={String(evaluated)}
            tone="success"
          />
          <Metric label="Bỏ qua" value={String(skipped)} />
          <Metric
            label="Điểm TB"
            value={formatScore(summary?.averageScore)}
            tone={summary?.averageScore && summary.averageScore < 7 ? 'danger' : 'default'}
          />
        </div>

        <ScrollArea className="min-h-0 flex-1 px-6 py-5">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Thông tin lần chạy
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoLine label="Run ID" value={run.id} />
                <InfoLine label="Trạng thái" value={run.status} />
                <InfoLine label="Bắt đầu" value={formatDateTime(run.startedAt)} />
                <InfoLine
                  label="Hoàn tất"
                  value={formatDateTime(run.finishedAt, 'Đang chạy')}
                />
              </div>
            </section>

            {agentScores.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-bold text-slate-800">
                  Điểm trung bình theo agent
                </div>
                <div className="mt-4 space-y-3">
                  {agentScores.map(([name, score]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span className="font-semibold text-slate-700">{name}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-900 shadow-sm">
                        {formatScore(score)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <AlertTriangle size={16} className="text-amber-500" />
                Chi tiết summary
              </div>
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                {formatJsonText(run.summary || run.errorMessage || 'Chưa có summary')}
              </pre>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function Metric({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'danger' | 'default' | 'success'
  value: string
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'danger'
        ? 'text-rose-700'
        : 'text-slate-900'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-xl font-black ${toneClass}`}>{value}</div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 break-all text-sm font-semibold text-slate-700">
        {value}
      </div>
    </div>
  )
}

function parseRunSummary(summary: string): ParsedRunSummary | null {
  try {
    const parsed = JSON.parse(summary) as ParsedRunSummary
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function formatScore(score?: number) {
  if (typeof score !== 'number') return 'Chưa có'
  return `${score}/10`
}

function formatJsonText(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}
