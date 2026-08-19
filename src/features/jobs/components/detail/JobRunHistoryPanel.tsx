import { Clock3, Eye, LoaderCircle } from '#/components/ui/icons'
import { formatDateTime } from '#/lib/helpers/datetime-helper'
import { formatJobRunFinishedAt } from '../../../../lib/helpers/job-helper'
import type { JobRunItem } from '../../../../lib/types/job'

const statusStyle: Record<JobRunItem['status'], string> = {
  failed: 'bg-rose-50 text-rose-700',
  partial: 'bg-amber-50 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  running: 'bg-indigo-50 text-indigo-700',
  success: 'bg-emerald-50 text-emerald-700',
}

const statusLabel: Record<JobRunItem['status'], string> = {
  failed: 'Thất bại',
  partial: 'Một phần',
  pending: 'Đang chờ',
  running: 'Đang chạy',
  success: 'Thành công',
}

export default function JobRunHistoryPanel({
  runs,
  onSelectRun,
}: {
  runs: JobRunItem[]
  onSelectRun?: (run: JobRunItem) => void
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-800">Lịch sử chạy</h2>
          <p className="mt-1 text-sm text-slate-400">
            Bấm vào một lần chạy để xem summary đánh giá AI.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          {runs.length} lượt
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {runs.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Clock3 size={19} />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-700">
              Chưa có lượt chạy
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Bấm Chạy thử để tạo lượt đánh giá đầu tiên.
            </div>
          </div>
        ) : (
          runs.map((run) => (
            <button
              key={run.id}
              type="button"
              onClick={() => onSelectRun?.(run)}
              className="block w-full px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-100"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  {run.status === 'running' ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Clock3 size={16} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-slate-800">
                      {formatRunSummary(run.summary)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        <Eye size={12} />
                        {run.evaluatedConversations ?? 0} đánh giá
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[run.status]}`}
                      >
                        {statusLabel[run.status]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>Bắt đầu: {formatDateTime(run.startedAt)}</span>
                    <span>Hoàn tất: {formatJobRunFinishedAt(run.finishedAt)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

function formatRunSummary(summary: string) {
  try {
    const parsed = JSON.parse(summary) as {
      averageScore?: number
      evaluatedConversations?: number
      skippedConversations?: number
    }

    if (
      typeof parsed.averageScore === 'number' ||
      typeof parsed.evaluatedConversations === 'number' ||
      typeof parsed.skippedConversations === 'number'
    ) {
      return [
        `Điểm TB: ${parsed.averageScore ?? 0}`,
        `Đã đánh giá: ${parsed.evaluatedConversations ?? 0}`,
        `Bỏ qua: ${parsed.skippedConversations ?? 0}`,
      ].join(' • ')
    }
  } catch {
    return summary
  }

  return summary
}
