import { useNavigate } from '@tanstack/react-router'
import PageHeader from '#/shared/components/PageHeader'
import { useToast } from '#/shared/components/Toast'
import JobForm from '../components/JobForm'
import { getJobErrorMessage } from '../lib/job-error-helper'
import { useCreateJobMutation } from '../service/jobs.queries'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'

export default function JobCreatePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const mutation = useCreateJobMutation(workspaceId)

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Tạo tác vụ AI mới"
        description="Thiết lập tác vụ phân tích theo từng bước."
      />
      <JobForm
        submitLabel="Tạo tác vụ AI"
        onSubmit={async (payload) => {
          try {
            const job = await mutation.mutateAsync(payload)
            toast({
              title: 'Đã tạo tác vụ AI',
              description: `${job.name} đã sẵn sàng để chạy.`,
              variant: 'success',
            })
            navigate({ to: '/jobs/$jobId', params: { jobId: job.id } })
          } catch (error) {
            toast({
              title: 'Không tạo được tác vụ AI',
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
