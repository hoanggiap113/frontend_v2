import { Bot, CalendarClock, Layers3, PlayCircle } from '#/components/ui/icons'
import type { AppIcon } from '#/components/ui/icons'
import {
  formatJobSchedule,
  JOB_STATUS_STYLES,
  JOB_TYPE_LABEL,
} from '../../../../lib/helpers/job-helper'
import { formatDateTime } from '#/lib/helpers/datetime-helper'
import type { JobItem, JobRunItem } from '../../../../lib/types/job'

const runStatusLabel: Record<JobItem['lastRunStatus'], string> = {
  failed: 'Lỗi',
  never: 'Chưa chạy',
  running: 'Đang chạy',
  success: 'Thành công',
}

const runStatusStyle: Record<JobItem['lastRunStatus'], string> = {
  failed: 'bg-rose-50 text-rose-700',
  never: 'bg-slate-100 text-slate-600',
  running: 'bg-indigo-50 text-indigo-700',
  success: 'bg-emerald-50 text-emerald-700',
}

export default function JobHeroPanel({
  job,
  runs,
}: {
  job: JobItem
  runs: JobRunItem[]
}) {
  const latestRun = runs[0]

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${JOB_STATUS_STYLES[job.status]}`}>
                {job.status}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${runStatusStyle[job.lastRunStatus]}`}>
                {runStatusLabel[job.lastRunStatus]}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-bold">{job.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              {job.description || 'Tác vụ AI này chưa có mô tả.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-white/60">
              Lần chạy gần nhất
            </div>
            <div className="mt-1 text-sm font-semibold">
              {latestRun ? formatDateTime(latestRun.startedAt) : 'Chưa có lượt chạy'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-slate-100 md:grid-cols-4">
        <HeroMetric
          icon={Layers3}
          label="Loại tác vụ"
          value={JOB_TYPE_LABEL[job.type] ?? job.type}
        />
        <HeroMetric
          icon={Bot}
          label="AI provider"
          value={`${job.provider} / ${job.model}`}
        />
        <HeroMetric
          icon={CalendarClock}
          label="Lịch chạy"
          value={formatJobSchedule(job.scheduleType, job.scheduleValue)}
        />
        <HeroMetric
          icon={PlayCircle}
          label="Số lượt chạy"
          value={`${runs.length} lần`}
        />
      </div>
    </section>
  )
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: AppIcon
  label: string
  value: string
}) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={14} className="text-emerald-500" />
        {label}
      </div>
      <div className="mt-2 truncate text-sm font-bold text-slate-800">
        {value}
      </div>
    </div>
  )
}
