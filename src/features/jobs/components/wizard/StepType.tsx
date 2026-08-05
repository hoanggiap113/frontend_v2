import {
  defaultClassificationRules,
  defaultRuleItems,
  defaultRules,
  jobTypes,
  statusOptions,
} from '../jobFormConfig'
import {
  FieldLabel,
  RadioDot,
  StepDescription,
  TextArea,
  TextInput,
} from './JobFormControls'
import type { JobStatus } from '../../types/job'
import type { JobStepBaseProps } from '../../types/job-form'

export default function StepType({ form, setFormValue }: JobStepBaseProps) {
  function sameRules(left: string[], right: string[]) {
    return (
      left.length === right.length &&
      left.every((item, index) => item === right[index])
    )
  }

  return (
    <section className="space-y-5">
      <StepDescription>
        Đặt tên và chọn loại công việc phân tích.
      </StepDescription>

      <label className="block">
        <TextInput
          value={form.name}
          onChange={(name) => setFormValue({ name })}
          placeholder="Tên công việc"
        />
      </label>

      <label className="block">
        <TextArea
          rows={3}
          value={form.description}
          onChange={(description) => setFormValue({ description })}
          placeholder="Mô tả"
        />
      </label>

      <div>
        <FieldLabel>Loại công việc</FieldLabel>
        <div className="space-y-3">
          {jobTypes.map((item) => {
            const selected = form.type === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  const next = { type: item.value }

                  if (
                    item.value === 'classification' &&
                    sameRules(form.rulesSummary, defaultRules)
                  ) {
                    setFormValue({
                      ...next,
                      rulesSummary: defaultClassificationRules,
                    })
                    return
                  }

                  if (
                    item.value === 'qc_analysis' &&
                    sameRules(form.rulesSummary, defaultClassificationRules)
                  ) {
                    setFormValue({
                      ...next,
                      rulesSummary: defaultRules,
                      ruleItems: defaultRuleItems,
                    })
                    return
                  }

                  setFormValue(next)
                }}
                className="flex w-full items-start gap-3 rounded px-3 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <RadioDot selected={selected} />
                <span>
                  <span className="block text-base font-medium text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-400">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <label className="block max-w-xs">
        <FieldLabel>Trạng thái sau khi lưu</FieldLabel>
        <select
          value={form.status}
          onChange={(event) =>
            setFormValue({ status: event.target.value as JobStatus })
          }
          className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          {statusOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
