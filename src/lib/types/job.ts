export type JobType =
  | 'qc_analysis'
  | 'classification'
  | 'auto_reply'
  | 'routing'
export type JobStatus = 'active' | 'inactive' | 'draft'
export type ApiJobType = 'QC' | 'CLASSIFICATION'
export type ApiJobScheduleType = 'MANUAL' | 'CRON'
export type ApiJobRunStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'PARTIAL'
export type JobRuleSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface JobRuleInput {
  id: string
  title: string
  content: string
  severity: JobRuleSeverity
}

export interface JobItem {
  id: string
  workspaceId: string
  name: string
  description: string
  type: JobType
  status: JobStatus
  provider: string
  model: string
  scheduleType: 'realtime' | 'cron' | 'after_sync'
  scheduleValue: string
  channels: string[]
  outputs: string[]
  rulesSummary: string[]
  businessContext?: string
  ruleItems?: JobRuleInput[]
  lastRunAt: string | null
  lastRunStatus: 'success' | 'running' | 'failed' | 'never'
  successRate: number
  createdAt: string
  updatedAt: string
}

export interface JobRunItem {
  id: string
  jobId: string
  startedAt: string
  finishedAt: string | null
  status: 'success' | 'running' | 'failed' | 'partial' | 'pending'
  summary: string
  totalConversations?: number
  evaluatedConversations?: number
  skippedConversations?: number
  errorMessage?: string | null
}

export interface JobResultItem {
  id: string
  runId: string
  conversationId: string
  customerName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resultType: string
  detail: string
  createdAt: string
}

export interface JobUpsertPayload {
  name: string
  description: string
  type: JobType
  status: JobStatus
  provider: string
  model: string
  scheduleType: 'realtime' | 'cron' | 'after_sync'
  scheduleValue: string
  channels: string[]
  outputs: string[]
  rulesSummary: string[]
  businessContext: string
  ruleItems: JobRuleInput[]
}

export interface CreateJobRequest {
  jobType: ApiJobType
  name: string
  description?: string
  inputChannelIds: string[]
  rulesContent?: string
  rulesConfig: unknown
  skipConditions?: unknown
  aiProvider: string
  aiModel: string
  outputs?: unknown
  scheduleType: ApiJobScheduleType
  scheduleCron?: string | null
}

export interface JobResponse {
  id: string
  tenantId: string
  jobType: ApiJobType
  name: string
  description: string | null
  inputChannelIds: string | null
  rulesContent: string | null
  rulesConfig: string | null
  skipConditions: string | null
  aiProvider: string
  aiModel: string
  outputs: string | null
  scheduleType: ApiJobScheduleType
  scheduleCron: string | null
  active: boolean
  lastRunAt: string | null
  lastRunStatus: string | null
  createdAt: string
  updatedAt: string | null
}

export interface JobRunResponse {
  id: string
  jobId: string
  status: ApiJobRunStatus
  startedAt: string
  finishedAt: string | null
  totalConversations: number
  evaluatedConversations: number
  skippedConversations: number
  summary: string | null
  errorMessage: string | null
  createdAt: string
}
