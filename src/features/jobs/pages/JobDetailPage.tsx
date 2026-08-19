import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Typography } from 'antd'
import { Pencil, PlayCircle, Trash2 } from '#/components/ui/icons'
import LoadingState from '#/components/ui/LoadingState'
import { useToast } from '#/app/providers/ToastProvider'
import JobConfigurationPanel from '../components/detail/JobConfigurationPanel'
import JobEvaluationModal from '../components/detail/JobEvaluationModal'
import JobHeroPanel from '../components/detail/JobHeroPanel'
import JobResultsPanel from '../components/detail/JobResultsPanel'
import JobRunHistoryPanel from '../components/detail/JobRunHistoryPanel'
import { getJobErrorMessage } from '../../../lib/helpers/job-error-helper'
import { channelsService } from '#/lib/services/channels.service'
import { jobsService } from '../../../lib/services/jobs.service'
import { queryKeys } from '#/lib/services/query-keys'
import { JOB_STATUS_POLL_INTERVAL_MS } from '../../../lib/hooks/jobs.queries'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import type { JobRunItem } from '../../../lib/types/job'

export default function JobDetailPage({ jobId }: { jobId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const [selectedRun, setSelectedRun] = useState<JobRunItem | null>(null)

  const { data: job, error: jobError } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.jobDetail(workspaceId || 'default', jobId),
    queryFn: () => jobsService.get(workspaceId, jobId),
    refetchInterval: JOB_STATUS_POLL_INTERVAL_MS,
  })

  const { data: runs = [], error: runsError } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.jobRuns(workspaceId || 'default', jobId),
    queryFn: () => jobsService.runs(workspaceId, jobId),
    refetchInterval: JOB_STATUS_POLL_INTERVAL_MS,
  })

  const { data: channels = [] } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.channels(workspaceId || 'default'),
    queryFn: () => channelsService.list(workspaceId),
  })

  const triggerMutation = useMutation({
    mutationFn: () => jobsService.trigger(workspaceId, jobId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.jobRuns(workspaceId || 'default', jobId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.jobDetail(workspaceId || 'default', jobId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.jobs(workspaceId || 'default'),
        }),
      ])
      toast({
        title: 'Đã kích hoạt tác vụ AI',
        description: 'Tác vụ AI đã được đưa vào hàng đợi chạy thử.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Không chạy được tác vụ AI',
        description: getJobErrorMessage(error, 'Vui lòng thử lại sau.'),
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => jobsService.remove(workspaceId, jobId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.jobs(workspaceId || 'default'),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.jobDetail(workspaceId || 'default', jobId),
        }),
      ])
      toast({
        title: 'Đã xóa tác vụ AI',
        description: job
          ? `${job.name} đã được tắt và không còn chạy nữa.`
          : 'Tác vụ AI đã được xóa.',
        variant: 'success',
      })
      navigate({ to: '/jobs' })
    },
    onError: (error) => {
      toast({
        title: 'Không xóa được tác vụ AI',
        description: getJobErrorMessage(error, 'Vui lòng thử lại sau.'),
        variant: 'error',
      })
    },
  })

  useEffect(() => {
    if (!jobError) return

    toast({
      title: 'Không tải được tác vụ AI',
      description: getJobErrorMessage(
        jobError,
        'Không tải được chi tiết tác vụ AI.',
      ),
      variant: 'error',
    })
  }, [jobError, toast])

  useEffect(() => {
    if (!runsError) return

    toast({
      title: 'Không tải được lịch sử chạy',
      description: getJobErrorMessage(
        runsError,
        'Không tải được lịch sử chạy tác vụ AI.',
      ),
      variant: 'error',
    })
  }, [runsError, toast])

  if (!job) {
    return (
      <LoadingState
        variant="page"
        title="Đang tải chi tiết tác vụ AI"
        description="Cấu hình và lịch sử tác vụ AI sẽ xuất hiện sau khi tải xong."
      />
    )
  }

  const selectedChannels = job.channels.map((channelId) => {
    const channel = channels.find((item) => item.id === channelId)

    return {
      id: channelId,
      name: channel?.name ?? `Kênh ${channelId.slice(0, 8)}`,
      type: channel?.type,
    }
  })

  return (
    <div className="space-y-6 p-6">
      <section className="page-header">
        <div className="page-header__content">
          <Typography.Title level={2} className="page-header__title">
            Chi tiết tác vụ AI
          </Typography.Title>
          <Typography.Text className="page-header__description">
            Theo dõi cấu hình, lượt chạy và kết quả đánh giá AI.
          </Typography.Text>
        </div>
        <div className="page-header__actions flex flex-wrap gap-2.5">
          <button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:pointer-events-none disabled:opacity-60"
          >
            <PlayCircle
              size={14}
              className={triggerMutation.isPending ? 'animate-spin' : ''}
            />
            {triggerMutation.isPending ? 'Đang chạy...' : 'Chạy thử'}
          </button>

          <Link
            to="/jobs/$jobId/edit"
            params={{ jobId }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Chỉnh sửa
          </Link>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:pointer-events-none disabled:opacity-60"
          >
            <Trash2 size={14} />
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </section>

      <JobHeroPanel job={job} runs={runs} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <JobConfigurationPanel
            channels={selectedChannels}
            outputs={job.outputs}
            rules={job.rulesSummary}
          />
          <JobRunHistoryPanel runs={runs} onSelectRun={setSelectedRun} />
        </div>

        <JobResultsPanel runs={runs} onSelectRun={setSelectedRun} />
      </div>

      {selectedRun ? (
        <JobEvaluationModal
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
        />
      ) : null}
    </div>
  )
}
