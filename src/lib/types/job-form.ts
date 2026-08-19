import type { Channel } from './channel'
import type { JobItem, JobStatus, JobType, JobUpsertPayload } from './job'

export interface JobFormProps {
  initialJob?: JobItem
  onSubmit: (payload: JobUpsertPayload) => Promise<void>
  submitLabel: string
}

export interface StoredJobDraft {
  step: number
  form: JobUpsertPayload
}

export interface JobTypeOption {
  value: JobType
  title: string
  description: string
}

export interface JobStatusOption {
  value: JobStatus
  label: string
}

export interface JobOutputOption {
  value: string
  title: string
  description: string
}

export interface JobScheduleOption {
  value: JobUpsertPayload['scheduleType']
  title: string
  description: string
}

export type SetJobFormValue = (next: Partial<JobUpsertPayload>) => void

export type ToggleJobArrayValue = (
  key: 'channels' | 'outputs',
  value: string,
) => void

export interface JobStepBaseProps {
  form: JobUpsertPayload
  setFormValue: SetJobFormValue
}

export interface JobChannelsStepProps {
  channels: Channel[]
  form: JobUpsertPayload
  toggleValue: ToggleJobArrayValue
}

export interface JobOutputStepProps {
  form: JobUpsertPayload
  toggleValue: ToggleJobArrayValue
}
