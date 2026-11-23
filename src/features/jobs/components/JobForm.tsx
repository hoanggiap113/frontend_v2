import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clearJobDraft, readJobDraft, writeJobDraft } from './jobDraftStorage'
import {
  jobFormSteps,
  normalizeJobFormState,
  toJobFormState,
} from './jobFormConfig'
import JobFormFooter from './wizard/JobFormFooter'
import JobStepper from './wizard/JobStepper'
import StepChannels from './wizard/StepChannels'
import StepConfirm from './wizard/StepConfirm'
import StepOutput from './wizard/StepOutput'
import StepRules from './wizard/StepRules'
import StepSchedule from './wizard/StepSchedule'
import StepType from './wizard/StepType'
import { channelsService } from '#/lib/services/channels.service'
import { queryKeys } from '#/lib/config/query-keys'
import { useCurrentTenant } from '#/app/providers/TenantProvider'
import type { JobUpsertPayload } from '../../../lib/types/job'
import type { JobFormProps } from '../../../lib/types/job-form'

export default function JobForm({
  initialJob,
  onSubmit,
  submitLabel,
}: JobFormProps) {
  const { currentTenantId: workspaceId } = useCurrentTenant()
  const storageKey = useMemo(
    () =>
      `cqa_job_form:${workspaceId || 'default'}:${initialJob?.id ?? 'create'}`,
    [initialJob?.id, workspaceId],
  )
  const storedDraft = useMemo(() => readJobDraft(storageKey), [storageKey])
  const [step, setStep] = useState(storedDraft?.step ?? 0)
  const [form, setForm] = useState<JobUpsertPayload>(
    normalizeJobFormState(storedDraft?.form ?? toJobFormState(initialJob)),
  )
  const [saving, setSaving] = useState(false)

  const { data: channels = [] } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.channels(workspaceId || 'default'),
    queryFn: () => channelsService.list(workspaceId),
  })

  const canProceed = useMemo(() => {
    if (step === 0) return form.name.trim().length >= 2
    if (step === 1) return form.channels.length > 0
    if (step === 2) {
      if (form.type === 'classification') return form.rulesSummary.length > 0
      return form.ruleItems.some(
        (rule) => rule.title.trim() && rule.content.trim(),
      )
    }
    if (step === 4 && form.scheduleType === 'cron') {
      return form.scheduleValue.trim().length > 0
    }
    return true
  }, [form, step])

  const validationMessage = useMemo(() => {
    if (step === 0) return 'Tối thiểu 2 ký tự'
    if (step === 1) return 'Chọn ít nhất một kênh'
    if (step === 2) return 'Nhập ít nhất một quy tắc'
    if (step === 4) return 'Chọn lịch chạy'
    return ''
  }, [step])

  function saveDraft(draftStep: number, nextForm: JobUpsertPayload) {
    writeJobDraft(storageKey, { step: draftStep, form: nextForm })
  }

  function setFormValue(next: Partial<JobUpsertPayload>) {
    setForm((current) => {
      const updated = { ...current, ...next }
      saveDraft(step, updated)
      return updated
    })
  }

  function goToStep(targetStep: number) {
    const next = Math.min(Math.max(targetStep, 0), jobFormSteps.length - 1)
    setStep(next)
    saveDraft(next, form)
  }

  function toggleValue(key: 'channels' | 'outputs', value: string) {
    setForm((current) => {
      const values = current[key]
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
      const updated = { ...current, [key]: nextValues }
      saveDraft(step, updated)
      return updated
    })
  }

  async function submit() {
    setSaving(true)
    try {
      await onSubmit(form)
      clearJobDraft(storageKey)
    } finally {
      setSaving(false)
    }
  }

  function nextStep() {
    if (!canProceed) return
    goToStep(step + 1)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <JobStepper currentStep={step} onStepChange={goToStep} />

      <div className="min-h-[450px] px-6 py-6">
        {step === 0 && <StepType form={form} setFormValue={setFormValue} />}
        {step === 1 && (
          <StepChannels
            channels={channels}
            form={form}
            toggleValue={toggleValue}
          />
        )}
        {step === 2 && <StepRules form={form} setFormValue={setFormValue} />}
        {step === 3 && <StepOutput form={form} toggleValue={toggleValue} />}
        {step === 4 && <StepSchedule form={form} setFormValue={setFormValue} />}
        {step === 5 && <StepConfirm form={form} />}
      </div>

      <JobFormFooter
        canProceed={canProceed}
        currentStep={step}
        onBack={() => goToStep(step - 1)}
        onNext={nextStep}
        onSubmit={submit}
        saving={saving}
        submitLabel={submitLabel}
        validationMessage={validationMessage}
      />
    </div>
  )
}
