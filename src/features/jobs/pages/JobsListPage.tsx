import { useEffect, type ReactNode } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Typography } from 'antd'
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  Workflow,
} from '#/components/ui/icons'
import LoadingState from '#/components/ui/LoadingState'
import { EmptyState, MetricTile, SectionCard } from '#/components'
import { useToast } from '#/app/providers/ToastProvider'
import { formatNumber } from '#/lib/helpers/number-helper'
import {
  formatJobLastRun,
  formatJobSchedule,
  JOB_STATUS_STYLES,
  JOB_TYPE_LABEL,
} from '../../../lib/helpers/job-helper'
import { getJobErrorMessage } from '../../../lib/helpers/job-error-helper'
import { jobsService } from '../../../lib/services/jobs.service'
import { queryKeys } from '#/lib/services/query-keys'
import {
  JOB_STATUS_POLL_INTERVAL_MS,
  useJobsQuery,
} from '../../../lib/hooks/jobs.queries'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import type { JobItem, JobRunItem } from '../../../lib/types/job'

const jobStatusLabel: Record<JobItem['status'], string> = {
  active: 'Đang bật',
  draft: 'Bản nháp',
  inactive: 'Tạm tắt',
}

function getRunTimestamp(run: JobRunItem) {
  return run.finishedAt ?? run.startedAt
}

function getLatestRun(runs: JobRunItem[] | undefined) {
  return [...(runs ?? [])].sort(
    (a, b) =>
      new Date(getRunTimestamp(b)).getTime() -
      new Date(getRunTimestamp(a)).getTime(),
  )[0]
}

function isProcessingRun(run: JobRunItem | undefined, job: JobItem) {
  return (
    run?.status === 'running' ||
    run?.status === 'pending' ||
    job.lastRunStatus === 'running'
  )
}

function hasFinishedRun(run: JobRunItem | undefined, job: JobItem) {
  return (
    run?.status === 'success' ||
    run?.status === 'failed' ||
    run?.status === 'partial' ||
    job.lastRunStatus === 'success' ||
    job.lastRunStatus === 'failed'
  )
}

export default function JobsListPage() {
  const { toast } = useToast()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const {
    data: jobs = [],
    error: loadError,
    isLoading,
  } = useJobsQuery(workspaceId)

  const jobRunQueries = useQueries({
    queries: jobs.map((job) => ({
      enabled: Boolean(workspaceId && job.id),
      queryKey: queryKeys.jobRuns(workspaceId || 'default', job.id),
      queryFn: () => jobsService.runs(workspaceId, job.id),
      refetchInterval: JOB_STATUS_POLL_INTERVAL_MS,
    })),
  })

  const latestRunsByJobId = new Map<string, JobRunItem>()
  jobs.forEach((job, index) => {
    const latestRun = getLatestRun(jobRunQueries[index]?.data)
    if (latestRun) latestRunsByJobId.set(job.id, latestRun)
  })

  const active = jobs.filter((job) => job.status === 'active').length
  const inactive = jobs.filter((job) => job.status === 'inactive').length
  const cron = jobs.filter((job) => job.scheduleType === 'cron').length
  const running = jobs.filter((job) =>
    isProcessingRun(latestRunsByJobId.get(job.id), job),
  ).length
  const hasResult = jobs.filter((job) =>
    hasFinishedRun(latestRunsByJobId.get(job.id), job),
  ).length

  const stats = [
    {
      label: 'Tổng tác vụ',
      value: formatNumber(jobs.length),
      note: `${active} đang bật, ${inactive} tạm tắt`,
      icon: Workflow,
      tone: 'emerald',
    },
    {
      label: 'Chạy theo lịch',
      value: formatNumber(cron),
      note: 'Tác vụ dùng lịch CRON từ backend',
      icon: CalendarClock,
      tone: 'indigo',
    },
    {
      label: 'Đang xử lý',
      value: formatNumber(running),
      note: 'Tự cập nhật từ lịch sử chạy, không cần tải lại trang',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Đã có kết quả',
      value: formatNumber(hasResult),
      note: 'Tác vụ đã có ít nhất một lần chạy kết thúc',
      icon: CheckCircle2,
      tone: 'sky',
    },
  ]

  useEffect(() => {
    if (!loadError) return

    toast({
      title: 'Không tải được tác vụ AI',
      description: getJobErrorMessage(
        loadError,
        'Không tải được danh sách tác vụ AI.',
      ),
      variant: 'error',
    })
  }, [loadError, toast])

  const metricAccent: Record<string, string> = {
    emerald: '#0f8f4e',
    indigo: '#4f46e5',
    amber: '#d97706',
    sky: '#0284c7',
  }

  return (
    <div className="page-container">
      <section className="page-header">
        <div className="page-header__content">
          <div className="page-header__eyebrow">Vận hành AI</div>
          <Typography.Title level={2} className="page-header__title">
            Tác vụ AI
          </Typography.Title>
          <Typography.Text className="page-header__description">
            Tạo, chạy và theo dõi các tác vụ AI đánh giá hội thoại trong một màn
            hình thống nhất.
          </Typography.Text>
        </div>
        <div className="page-header__actions">
          <Link
            to="/jobs/create"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={14} />
            Tạo tác vụ AI
          </Link>
        </div>
      </section>

      <div className="metric-grid mb-5">
        {stats.map((item) => {
          const Icon = item.icon
          const accent = metricAccent[item.tone] ?? '#0f8f4e'

          return (
            <MetricTile
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
              accent={accent}
              icon={<Icon size={18} />}
            />
          )
        })}
      </div>

      <SectionCard
        title="Danh sách tác vụ AI"
        description="Quản lý tác vụ QC, phân loại và lịch chạy từ backend."
        extra={
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {jobs.length} tác vụ
          </span>
        }
        bodyClassName="!p-0"
      >
        {isLoading ? (
          <LoadingState
            title="Đang tải tác vụ AI"
            description="Danh sách tác vụ sẽ xuất hiện sau khi tải xong."
            className="m-5"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="Chưa có tác vụ AI nào"
            description="Tạo tác vụ đầu tiên để AI bắt đầu đánh giá hội thoại."
            action={
              <Link
                to="/jobs/create"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus size={14} />
                Tạo tác vụ AI
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 p-4 lg:hidden">
            {jobs.map((job) => (
              <JobMobileCard
                key={job.id}
                job={job}
                latestRun={latestRunsByJobId.get(job.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && jobs.length > 0 ? (
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[1040px] table-fixed text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[30%] px-5 py-3">Tác vụ</th>
                  <th className="w-[13%] px-5 py-3">Loại</th>
                  <th className="w-[12%] px-5 py-3">Trạng thái</th>
                  <th className="w-[16%] px-5 py-3">AI runtime</th>
                  <th className="w-[18%] px-5 py-3">Lịch chạy</th>
                  <th className="w-[11%] px-5 py-3">Lần chạy gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-t border-slate-100 align-top transition-colors hover:bg-emerald-50/30"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        {job.name}
                      </Link>
                      <div className="mt-1 max-w-[420px] text-slate-500">
                        {job.description || 'Chưa có mô tả.'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {JOB_TYPE_LABEL[job.type] ?? job.type}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${JOB_STATUS_STYLES[job.status]}`}
                      >
                        {jobStatusLabel[job.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="font-semibold text-slate-700">
                        {job.provider}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {job.model}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatJobSchedule(job.scheduleType, job.scheduleValue)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <JobLastRunContent
                        job={job}
                        latestRun={latestRunsByJobId.get(job.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}
function JobMobileCard({
  job,
  latestRun,
}: {
  job: JobItem
  latestRun?: JobRunItem
}) {
  return (
    <Link
      to="/jobs/$jobId"
      params={{ jobId: job.id }}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-bold text-emerald-700">{job.name}</div>
          <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
            {job.description || 'Chưa có mô tả.'}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${JOB_STATUS_STYLES[job.status]}`}
        >
          {jobStatusLabel[job.status]}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <JobMobileMeta
          label="Loại"
          value={JOB_TYPE_LABEL[job.type] ?? job.type}
        />
        <JobMobileMeta
          label="AI runtime"
          value={`${job.provider} / ${job.model}`}
        />
        <JobMobileMeta
          label="Lịch chạy"
          value={formatJobSchedule(job.scheduleType, job.scheduleValue)}
        />
        <JobMobileMeta
          label="Lần chạy gần nhất"
          value={<JobLastRunContent job={job} latestRun={latestRun} compact />}
        />
      </div>
    </Link>
  )
}

function JobMobileMeta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </div>
    </div>
  )
}

function JobLastRunContent({
  job,
  latestRun,
  compact = false,
}: {
  job: JobItem
  latestRun?: JobRunItem
  compact?: boolean
}) {
  if (!latestRun) {
    return (
      <span className="text-slate-500">{formatJobLastRun(job.lastRunAt)}</span>
    )
  }

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div className="text-xs font-medium text-slate-500">
        {formatJobLastRun(getRunTimestamp(latestRun))}
      </div>
    </div>
  )
}
