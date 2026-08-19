import { CheckCircle2 } from '#/components/ui/icons'
import { clsx } from 'clsx'
import { outputOptions } from '../jobFormConfig'
import { StepDescription } from './JobFormControls'
import type { JobOutputStepProps } from '../../../../lib/types/job-form'

export default function StepOutput({ form, toggleValue }: JobOutputStepProps) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Đầu ra</h3>
        <StepDescription>
          Chọn nơi nhận kết quả phân tích. Dashboard là đầu ra mặc định nếu chưa
          cấu hình tích hợp ngoài.
        </StepDescription>
      </div>

      <div className="divide-y divide-slate-100 rounded border border-slate-200">
        {outputOptions.map((item) => {
          const selected = form.outputs.includes(item.value)
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => toggleValue('outputs', item.value)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span
                className={clsx(
                  'mt-0.5 flex h-5 w-5 items-center justify-center rounded border',
                  selected
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-slate-300 bg-white',
                )}
              >
                {selected && <CheckCircle2 size={13} />}
              </span>
              <span>
                <span className="block font-medium text-slate-900">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  {item.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
