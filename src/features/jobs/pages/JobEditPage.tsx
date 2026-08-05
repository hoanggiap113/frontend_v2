import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import LoadingState from '#/shared/components/LoadingState'
import PageHeader from '#/shared/components/PageHeader'
import { useToast } from '#/shared/components/Toast'
import JobForm from '../components/JobForm'
import { getJobErrorMessage } from '../lib/job-error-helper'
import {
  useJobDetailQuery,
  useUpdateJobMutation,
} from '../service/jobs.queries'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'

export default function JobEditPage({ jobId }: { jobId: string }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const { data: job, error: loadError } = useJobDetailQuery(workspaceId, jobId)
  const updateJobMutation = useUpdateJobMutation(workspaceId, jobId)

  useEffect(() => {
    if (!loadError) return

    toast({
      title: 'Không tải được tác vụ AI',
      description: getJobErrorMessage(
        loadError,
        'Không tải được thông tin tác vụ AI.',
      ),
      variant: 'error',
    })
  }, [loadError, toast])

  if (!job) {
    return (
      <LoadingState
        variant="page"
        title="Đang tải tác vụ AI"
        description="Form chỉnh sửa sẽ xuất hiện sau khi tải xong."
      />
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={`Chỉnh sửa: ${job.name}`}
        description="Cập nhật cấu hình, provider, model, quy tắc và lịch chạy của tác vụ AI."
      />
      <JobForm
        initialJob={job}
        submitLabel="Cập nhật tác vụ AI"
        onSubmit={async (payload) => {
          try {
            await updateJobMutation.mutateAsync(payload)
            toast({
              title: 'Đã cập nhật tác vụ AI',
              description: 'Thay đổi đã được lưu.',
              variant: 'success',
            })
            navigate({ to: '/jobs/$jobId', params: { jobId } })
          } catch (error) {
            toast({
              title: 'Không cập nhật được tác vụ AI',
              description: getJobErrorMessage(
                error,
                'Vui lòng kiểm tra cấu hình và thử lại.',
              ),
              variant: 'error',
            })
          }
        }}
      />
    </div>
  )
}
