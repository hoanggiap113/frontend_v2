import { isMockMode } from '#/lib/env'
import {
  DEFAULT_JOB_BUSINESS_CONTEXT,
  JOB_RULE_API_META,
} from '#/constant'
import { mockJobResults, mockJobs, mockJobRuns } from './mocks/jobs.mock'
import { endpoints } from '#/lib/services/endpoints'
import { httpClient } from '#/lib/services/http/client'
import { clone, mockDelay } from '#/lib/utils'
import type {
  ApiJobRunStatus,
  ApiJobScheduleType,
  ApiJobType,
  CreateJobRequest,
  JobItem,
  JobRuleInput,
  JobResponse,
  JobResultItem,
  JobRunItem,
  JobRunResponse,
  JobType,
  JobUpsertPayload,
} from '../types/job'

let jobState = clone(mockJobs)
let runState = clone(mockJobRuns)
let resultState = clone(mockJobResults)

function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function parseJsonObject<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function toApiJobType(type: JobType): ApiJobType {
  return type === 'classification' ? 'CLASSIFICATION' : 'QC'
}

function toUiJobType(type: ApiJobType): JobType {
  return type === 'CLASSIFICATION' ? 'classification' : 'qc_analysis'
}

function toApiScheduleType(
  type: JobUpsertPayload['scheduleType'],
): ApiJobScheduleType {
  return type === 'cron' ? 'CRON' : 'MANUAL'
}

function normalizeCronExpression(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 5) return `0 ${parts.join(' ')}`
  return parts.join(' ')
}

function toUiScheduleType(
  type: ApiJobScheduleType,
): JobUpsertPayload['scheduleType'] {
  return type === 'CRON' ? 'cron' : 'after_sync'
}

function toUiRunStatus(
  status: string | null | undefined,
): JobItem['lastRunStatus'] {
  if (status === 'SUCCESS') return 'success'
  if (status === 'FAILED') return 'failed'
  if (status === 'RUNNING' || status === 'PENDING') return 'running'
  return 'never'
}

function toRunItemStatus(status: ApiJobRunStatus): JobRunItem['status'] {
  const statusMap: Record<ApiJobRunStatus, JobRunItem['status']> = {
    FAILED: 'failed',
    PARTIAL: 'partial',
    PENDING: 'pending',
    RUNNING: 'running',
    SUCCESS: 'success',
  }

  return statusMap[status]
}

function buildClassificationConfig(payload: JobUpsertPayload) {
  return {
    categories: payload.rulesSummary.map((rule, index) => {
      const [rawLabel, ...descriptionParts] = rule.split(':')
      const label = rawLabel.trim()
      const description = descriptionParts.join(':').trim()

      return {
        id: `C${String(index + 1).padStart(3, '0')}`,
        name: label || `Nhãn ${index + 1}`,
        description: description || rule,
        severity: 'MEDIUM',
      }
    }),
  }
}

function buildRulesConfig(payload: JobUpsertPayload) {
  if (payload.type === 'classification') {
    return buildClassificationConfig(payload)
  }

  return {
    scoringScale: 10,
    passingScore: 7,
    rules: payload.ruleItems.map((rule, index) => {
      const severity = JOB_RULE_API_META[rule.severity]
      const context = payload.businessContext.trim()
      const description = context
        ? `${rule.content.trim()}\nBối cảnh áp dụng: ${context}`
        : rule.content.trim()

      return {
        id: `R${String(index + 1).padStart(3, '0')}`,
        name: rule.title.trim() || `Rule ${index + 1}`,
        description,
        weight: severity.weight,
        severity: severity.apiValue,
      }
    }),
  }
}

function buildRulesContent(payload: JobUpsertPayload): string {
  if (payload.type === 'classification') return payload.rulesSummary.join('\n')

  const lines = [
    '# Bộ Quy Tắc Đánh Giá Chất Lượng CSKH',
    '',
    '## Bối cảnh',
    payload.businessContext.trim() || 'Không có bối cảnh bổ sung.',
    '',
  ]

  payload.ruleItems.forEach((rule, index) => {
    const severity = JOB_RULE_API_META[rule.severity]

    lines.push(
      `## Rule ${index + 1}: ${rule.title.trim() || `Rule ${index + 1}`}`,
      `**Mô tả:** ${rule.content.trim()}`,
      `**Mức độ vi phạm:** ${severity.apiValue} (weight ${severity.weight})`,
      '',
    )
  })

  return lines.join('\n').trim()
}

interface StoredRuleConfig {
  id?: string
  name?: string
  description?: string
  weight?: number
  severity?: string
}

interface StoredClassificationCategory {
  id?: string
  name?: string
  description?: string
  severity?: string
}

function toRuleSeverity(value: string | undefined): JobRuleInput['severity'] {
  const normalized = value?.toLowerCase()
  if (normalized === 'critical') return 'critical'
  if (normalized === 'high') return 'high'
  if (normalized === 'low') return 'low'
  return 'medium'
}

function parseBusinessContext(rulesContent: string | null): string {
  if (!rulesContent) return DEFAULT_JOB_BUSINESS_CONTEXT

  const match = rulesContent.match(/## Bối cảnh\s+([\s\S]*?)(?:\n## Rule|\s*$)/)
  return match?.[1]?.trim() || DEFAULT_JOB_BUSINESS_CONTEXT
}

function toRuleItemsFromConfig(rulesConfig: string | null): JobRuleInput[] {
  const parsed = parseJsonObject<{ rules?: StoredRuleConfig[] }>(rulesConfig)
  if (!Array.isArray(parsed?.rules)) return []

  return parsed.rules.map((rule, index) => {
    const [description] = (rule.description ?? '').split('\nBối cảnh áp dụng:')

    return {
      id: rule.id ?? `rule_${index + 1}`,
      title: rule.name ?? `Rule ${index + 1}`,
      content: description.trim(),
      severity: toRuleSeverity(rule.severity),
    }
  })
}

function toClassificationRulesFromConfig(rulesConfig: string | null): string[] {
  const parsed = parseJsonObject<{
    categories?: StoredClassificationCategory[]
  }>(rulesConfig)
  if (!Array.isArray(parsed?.categories)) return []

  return parsed.categories.map((category, index) => {
    const name = category.name?.trim() || `Nhãn ${index + 1}`
    const description = category.description?.trim() || ''
    return description ? `${name}: ${description}` : name
  })
}

function toCreateJobRequest(payload: JobUpsertPayload): CreateJobRequest {
  return {
    aiModel: payload.model || 'gemini-3.5-flash',
    aiProvider: payload.provider || 'GEMINI',
    description: payload.description,
    inputChannelIds: payload.channels,
    jobType: toApiJobType(payload.type),
    name: payload.name,
    outputs: payload.outputs,
    rulesConfig: buildRulesConfig(payload),
    rulesContent: buildRulesContent(payload),
    scheduleCron:
      payload.scheduleType === 'cron'
        ? normalizeCronExpression(payload.scheduleValue)
        : null,
    scheduleType: toApiScheduleType(payload.scheduleType),
    skipConditions: null,
  }
}

function toUpdateJobRequest(payload: JobUpsertPayload) {
  return {
    active: payload.status === 'active',
    aiModel: payload.model || 'gemini-3.5-flash',
    aiProvider: payload.provider || 'GEMINI',
    description: payload.description,
    inputChannelIds: payload.channels,
    jobType: toApiJobType(payload.type),
    name: payload.name,
    outputs: payload.outputs,
    rulesConfig: buildRulesConfig(payload),
    rulesContent: buildRulesContent(payload),
    scheduleCron:
      payload.scheduleType === 'cron'
        ? normalizeCronExpression(payload.scheduleValue)
        : null,
    scheduleType: toApiScheduleType(payload.scheduleType),
    skipConditions: null,
  }
}

function toJobItem(response: JobResponse): JobItem {
  const channels = parseJsonArray(response.inputChannelIds)
  const outputs = parseJsonArray(response.outputs)
  const ruleItems = toRuleItemsFromConfig(response.rulesConfig)
  const classificationRules = toClassificationRulesFromConfig(
    response.rulesConfig,
  )
  const fallbackRules = response.rulesContent?.split('\n').filter(Boolean) ?? []
  const rulesSummary =
    response.jobType === 'CLASSIFICATION'
      ? classificationRules.length > 0
        ? classificationRules
        : fallbackRules
      : ruleItems.length > 0
        ? ruleItems.map((rule) => `${rule.title}: ${rule.content}`)
        : fallbackRules

  return {
    channels,
    createdAt: response.createdAt,
    description: response.description ?? '',
    id: response.id,
    lastRunAt: response.lastRunAt,
    lastRunStatus: toUiRunStatus(response.lastRunStatus),
    model: response.aiModel,
    name: response.name,
    outputs,
    provider: response.aiProvider,
    businessContext: parseBusinessContext(response.rulesContent),
    ruleItems,
    rulesSummary,
    scheduleType: toUiScheduleType(response.scheduleType),
    scheduleValue:
      response.scheduleType === 'CRON'
        ? (response.scheduleCron ?? '')
        : 'Chạy thủ công',
    status: response.active ? 'active' : 'inactive',
    successRate: 0,
    type: toUiJobType(response.jobType),
    updatedAt: response.updatedAt ?? response.createdAt,
    workspaceId: response.tenantId,
  }
}

function toJobRunItem(response: JobRunResponse): JobRunItem {
  return {
    errorMessage: response.errorMessage,
    evaluatedConversations: response.evaluatedConversations,
    finishedAt: response.finishedAt,
    id: response.id,
    jobId: response.jobId,
    skippedConversations: response.skippedConversations,
    startedAt: response.startedAt,
    status: toRunItemStatus(response.status),
    summary:
      response.summary ||
      response.errorMessage ||
      `${response.evaluatedConversations}/${response.totalConversations} cuộc chat đã đánh giá`,
    totalConversations: response.totalConversations,
  }
}

export const jobsService = {
  async list(workspaceId: string): Promise<JobItem[]> {
    if (isMockMode()) {
      await mockDelay()
      return clone(jobState.filter((item) => item.workspaceId === workspaceId))
    }

    const response = await httpClient.get<JobResponse[]>(
      endpoints.jobs.list(workspaceId),
    )
    return response.map(toJobItem)
  },

  async get(workspaceId: string, jobId: string): Promise<JobItem | null> {
    if (isMockMode()) {
      await mockDelay()
      return clone(
        jobState.find(
          (item) => item.workspaceId === workspaceId && item.id === jobId,
        ) ?? null,
      )
    }

    const response = await httpClient.get<JobResponse>(
      endpoints.jobs.detail(workspaceId, jobId),
    )
    return toJobItem(response)
  },

  async create(
    workspaceId: string,
    payload: JobUpsertPayload,
  ): Promise<JobItem> {
    if (isMockMode()) {
      await mockDelay(240)
      const item: JobItem = {
        ...payload,
        createdAt: new Date().toISOString(),
        id: `job_${Date.now()}`,
        lastRunAt: null,
        lastRunStatus: 'never',
        successRate: 0,
        updatedAt: new Date().toISOString(),
        workspaceId,
      }
      jobState = [item, ...jobState]
      return clone(item)
    }

    const response = await httpClient.post<JobResponse>(
      endpoints.jobs.list(workspaceId),
      toCreateJobRequest(payload),
    )
    return toJobItem(response)
  },

  async update(
    workspaceId: string,
    jobId: string,
    payload: JobUpsertPayload,
  ): Promise<JobItem> {
    if (isMockMode()) {
      await mockDelay(240)
      jobState = jobState.map((item) =>
        item.id === jobId
          ? { ...item, ...payload, updatedAt: new Date().toISOString() }
          : item,
      )
      return clone(jobState.find((item) => item.id === jobId)!)
    }

    const response = await httpClient.put<JobResponse>(
      endpoints.jobs.detail(workspaceId, jobId),
      toUpdateJobRequest(payload),
    )
    return toJobItem(response)
  },

  async remove(workspaceId: string, jobId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay()
      jobState = jobState.filter((item) => item.id !== jobId)
      runState = runState.filter((item) => item.jobId !== jobId)
      return
    }

    await httpClient.delete(endpoints.jobs.detail(workspaceId, jobId))
  },

  async runs(workspaceId: string, jobId: string): Promise<JobRunItem[]> {
    if (isMockMode()) {
      await mockDelay()
      return clone(runState.filter((item) => item.jobId === jobId))
    }

    const response = await httpClient.get<JobRunResponse[]>(
      endpoints.jobs.runs(workspaceId, jobId),
    )
    return response.map(toJobRunItem)
  },

  async results(workspaceId: string, jobId: string): Promise<JobResultItem[]> {
    if (isMockMode()) {
      await mockDelay()
      const runIds = runState
        .filter((run) => run.jobId === jobId)
        .map((run) => run.id)
      return clone(resultState.filter((item) => runIds.includes(item.runId)))
    }

    void workspaceId
    void jobId
    return []
  },

  async trigger(workspaceId: string, jobId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay(360)
      runState = [
        {
          evaluatedConversations: 0,
          finishedAt: null,
          id: `run_${Date.now()}`,
          jobId,
          skippedConversations: 0,
          startedAt: new Date().toISOString(),
          status: 'running',
          summary: 'Workflow đang được kích hoạt thủ công.',
          totalConversations: 0,
        },
        ...runState,
      ]
      return
    }

    await httpClient.post(endpoints.jobs.trigger(workspaceId, jobId))
  },
}
