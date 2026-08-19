import { ChevronLeft, ChevronRight } from '#/components/ui/icons'
import { jobFormSteps } from '../jobFormConfig'

export default function JobFormFooter({
  canProceed,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  saving,
  submitLabel,
  validationMessage,
}: {
  canProceed: boolean
  currentStep: number
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  saving: boolean
  submitLabel: string
  validationMessage: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-5">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Quay lại
        </button>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-3">
        {!canProceed && (
          <span className="text-sm text-red-500">{validationMessage}</span>
        )}
        {currentStep < jobFormSteps.length - 1 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-50"
          >
            Tiếp <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}
