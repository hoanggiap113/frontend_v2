import {
  aiModelOptions,
  aiProviderOptions,
  jobTypes,
  statusOptions,
} from '../jobFormConfig'
import { StepDescription, SummaryRow } from './JobFormControls'
import { formatJobSchedule } from '../../../../lib/helpers/job-helper'
import type { JobUpsertPayload } from '../../../../lib/types/job'

export default function StepConfirm({ form }: { form: JobUpsertPayload }) {
  const ruleCount =
    form.type === 'classification'
      ? form.rulesSummary.length
      : form.ruleItems.length

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Xác nhận</h3>
        <StepDescription>
          Kiểm tra lại thông tin trước khi tạo công việc.
        </StepDescription>
      </div>

      <div className="overflow-hidden rounded border border-slate-200">
        <SummaryRow label="Tên công việc" value={form.name || 'Chưa nhập'} />
        <SummaryRow
          label="Loại công việc"
          value={
            jobTypes.find((item) => item.value === form.type)?.title ??
            form.type
          }
        />
        <SummaryRow label="Kênh chat" value={`${form.channels.length} kênh`} />
        <SummaryRow label="Quy tắc cho AI" value={`${ruleCount} rule`} />
        {form.type === 'qc_analysis' ? (
          <SummaryRow
            label="Bối cảnh"
            value={form.businessContext || 'Chưa nhập'}
          />
        ) : null}
        <SummaryRow
          label="Đầu ra"
          value={form.outputs.length > 0 ? form.outputs.join(', ') : 'Không có'}
        />
        <SummaryRow
          label="Lịch chạy"
          value={formatJobSchedule(form.scheduleType, form.scheduleValue)}
        />
        <SummaryRow
          label="Provider"
          value={
            aiProviderOptions.find((item) => item.value === form.provider)
              ?.label ?? form.provider
          }
        />
        <SummaryRow
          label="Model"
          value={
            aiModelOptions.find((item) => item.value === form.model)?.label ??
            form.model
          }
        />
        <SummaryRow
          label="Trạng thái"
          value={
            statusOptions.find((item) => item.value === form.status)?.label ??
            form.status
          }
        />
      </div>
    </section>
  )
}
