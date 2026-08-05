import { Plus, RotateCcw, Trash2 } from '#/shared/ui/icons'
import {
  defaultBusinessContext,
  defaultClassificationRules,
  defaultRuleItems,
  defaultRules,
  getSeverityOption,
  severityOptions,
} from '../jobFormConfig'
import {
  FieldLabel,
  StepDescription,
  TextArea,
  TextInput,
} from './JobFormControls'
import type { JobRuleInput, JobRuleSeverity } from '../../types/job'
import type { JobStepBaseProps } from '../../types/job-form'

export default function StepRules({ form, setFormValue }: JobStepBaseProps) {
  function syncRuleSummary(ruleItems: JobRuleInput[]) {
    return ruleItems.map(
      (rule) => `${rule.title.trim() || 'Rule'}: ${rule.content.trim()}`,
    )
  }

  function addRule() {
    const nextIndex = form.ruleItems.length + 1
    const nextRule: JobRuleInput = {
      id: `rule_${Date.now()}`,
      title: `Rule ${nextIndex}`,
      content: '',
      severity: 'medium',
    }
    const ruleItems = [...form.ruleItems, nextRule]

    setFormValue({
      ruleItems,
      rulesSummary: syncRuleSummary(ruleItems),
    })
  }

  function updateRule(index: number, next: Partial<JobRuleInput>) {
    const ruleItems = form.ruleItems.map((rule, ruleIndex) =>
      ruleIndex === index ? { ...rule, ...next } : rule,
    )

    setFormValue({
      ruleItems,
      rulesSummary: syncRuleSummary(ruleItems),
    })
  }

  function removeRule(index: number) {
    const ruleItems = form.ruleItems.filter(
      (_, ruleIndex) => ruleIndex !== index,
    )

    setFormValue({
      ruleItems,
      rulesSummary: syncRuleSummary(ruleItems),
    })
  }

  function resetQcTemplate() {
    setFormValue({
      businessContext: defaultBusinessContext,
      ruleItems: defaultRuleItems,
      rulesSummary: defaultRules,
    })
  }

  if (form.type === 'classification') {
    return (
      <section className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Quy tắc phân loại
          </h3>
          <StepDescription>
            Cấu hình các nhãn để AI tự động phân loại cuộc chat.
          </StepDescription>
        </div>

        <div className="space-y-3">
          {form.rulesSummary.map((rule, index) => {
            const [label, ...descriptionParts] = rule.split(':')

            return (
              <div
                key={`${rule}-${index}`}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[180px_minmax(0,1fr)_auto]"
              >
                <TextInput
                  value={label.trim()}
                  onChange={(value) => {
                    const nextRules = [...form.rulesSummary]
                    nextRules[index] =
                      `${value}: ${descriptionParts.join(':').trim()}`
                    setFormValue({ rulesSummary: nextRules })
                  }}
                  placeholder="Tên nhãn"
                />
                <TextInput
                  value={descriptionParts.join(':').trim()}
                  onChange={(value) => {
                    const nextRules = [...form.rulesSummary]
                    nextRules[index] = `${label.trim()}: ${value}`
                    setFormValue({ rulesSummary: nextRules })
                  }}
                  placeholder="Mô tả rule phân loại"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormValue({
                      rulesSummary: form.rulesSummary.filter(
                        (_, ruleIndex) => ruleIndex !== index,
                      ),
                    })
                  }
                  className="inline-flex items-center justify-center rounded-xl border border-rose-100 px-3 py-2 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setFormValue({
                rulesSummary: [
                  ...form.rulesSummary,
                  'Nhãn mới: Mô tả điều kiện phân loại',
                ],
              })
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={14} /> Thêm nhãn
          </button>
          <button
            type="button"
            onClick={() =>
              setFormValue({ rulesSummary: defaultClassificationRules })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} /> Áp dụng mẫu
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Quy tắc đánh giá CSKH
        </h3>
        <StepDescription>
          Thêm từng rule, nhập nội dung đánh giá và chọn mức độ vi phạm.
        </StepDescription>
      </div>

      <label className="block">
        <FieldLabel>Bối cảnh đánh giá</FieldLabel>
        <TextArea
          rows={4}
          value={form.businessContext}
          onChange={(businessContext) => setFormValue({ businessContext })}
          placeholder="Ví dụ: Đây là cửa hàng ABC, chuyên bán đồ điện tử..."
        />
      </label>

      <div className="space-y-4">
        {form.ruleItems.map((rule, index) => {
          const severity = getSeverityOption(rule.severity)

          return (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Rule {index + 1}
                  </div>
                  <div
                    className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${severity.tone}`}
                  >
                    {severity.label}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  disabled={form.ruleItems.length <= 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_180px]">
                <label className="block">
                  <FieldLabel>Tên rule</FieldLabel>
                  <TextInput
                    value={rule.title}
                    onChange={(title) => updateRule(index, { title })}
                    placeholder="Ví dụ: Chào hỏi lịch sự"
                  />
                </label>

                <label className="block">
                  <FieldLabel>Mức độ vi phạm</FieldLabel>
                  <select
                    value={rule.severity}
                    onChange={(event) =>
                      updateRule(index, {
                        severity: event.target.value as JobRuleSeverity,
                      })
                    }
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {severityOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-3 block">
                <FieldLabel>Nội dung rule</FieldLabel>
                <TextArea
                  rows={3}
                  value={rule.content}
                  onChange={(content) => updateRule(index, { content })}
                  placeholder="Mô tả tiêu chí đạt, hành vi vi phạm hoặc yêu cầu cần kiểm tra..."
                />
              </label>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRule}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={14} /> Thêm rule
        </button>
        <button
          type="button"
          onClick={resetQcTemplate}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={14} /> Áp dụng mẫu CSKH
        </button>
      </div>
    </section>
  )
}
