import { Clock3, FileText, SearchCheck } from '#/shared/ui/icons'
import { formatDateTime } from '#/shared/lib/datetime-helper'
import type { JobRunItem } from '../../types/job'

export default function JobResultsPanel({
  runs,
  onSelectRun,
}: {
  runs: JobRunItem[]
  onSelectRun?: (run: JobRunItem) => void
}) {
  const latestRuns = runs.slice(0, 6)

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-800">Kết quả gần nhất</h2>
          <p className="mt-1 text-sm text-slate-400">
            Tổng quan đánh giá lấy từ lịch sử chạy job.
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <SearchCheck size={18} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {latestRuns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400">
              <FileText size={18} />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-700">
              Chưa có kết quả
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-400">
              Sau khi tác vụ AI chạy, summary của lần chạy sẽ xuất hiện ở đây.
            </div>
          </div>
        ) : (
          latestRuns.map((run) => {
            const summary = parseRunSummary(run.summary)

            return (
              <button
                key={run.id}
                type="button"
                onClick={() => onSelectRun?.(run)}
                className="block w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Clock3 size={15} className="text-slate-400" />
                      {formatDateTime(run.startedAt)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {run.evaluatedConversations ?? summary?.evaluatedConversations ?? 0}
                      /{run.totalConversations ?? 0} chat đã đánh giá
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {formatScore(summary?.averageScore)}
                  </span>
                </div>
                <div className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                  {formatRunSummary(run.summary)}
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

function parseRunSummary(summary: string) {
  try {
    return JSON.parse(summary) as {
      averageScore?: number
      evaluatedConversations?: number
      skippedConversations?: number
    }
  } catch {
    return null
  }
}

function formatRunSummary(summary: string) {
  const parsed = parseRunSummary(summary)
  if (!parsed) return summary

  return [
    `Điểm TB: ${parsed.averageScore ?? 0}`,
    `Đã đánh giá: ${parsed.evaluatedConversations ?? 0}`,
    `Bỏ qua: ${parsed.skippedConversations ?? 0}`,
  ].join(' • ')
}

function formatScore(score?: number) {
  if (typeof score !== 'number') return 'Chưa có điểm'
  return `${score}/10`
}
