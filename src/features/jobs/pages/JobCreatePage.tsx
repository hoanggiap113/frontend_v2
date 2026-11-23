import { useNavigate } from '@tanstack/react-router'
import { Typography } from 'antd'
import { useToast } from '#/app/providers/ToastProvider'
import JobForm from '../components/JobForm'
import { getJobErrorMessage } from '../../../lib/helpers/job-error-helper'
import { useCreateJobMutation } from '../../../lib/hooks/jobs.queries'
import { useCurrentTenant } from '#/app/providers/TenantProvider'

export default function JobCreatePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentTenantId: workspaceId } = useCurrentTenant()
  const mutation = useCreateJobMutation(workspaceId)

  return (
    <div className="space-y-6 p-6">
      <section className="page-header">
        <div className="page-header__content">
          <Typography.Title level={2} className="page-header__title">
            Tạo tác vụ AI mới
          </Typography.Title>
          <Typography.Text className="page-header__description">
            Thiết lập tác vụ phân tích theo từng bước.
          </Typography.Text>
        </div>
      </section>
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
