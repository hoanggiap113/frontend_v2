export interface DashboardFilter {
  from?: string
  to?: string
  jobId?: string
}

export interface OverviewResponse {
  totalEvaluated: number
  avgScore: number
  passRate: number
  totalViolations: number
  violationsBySeverity: Record<string, number>
}

export interface AgentStatsResponse {
  agents: Array<{
    agentId: string
    agentName: string
    avgScore: number
    totalEvaluated: number
    passRate: number
  }>
}

export interface ScoreTrendResponse {
  trend: Array<{
    date: string
    avgScore: number
    total: number
    passed: number
  }>
}

export interface TagStatsResponse {
  tags: Array<{
    tag: string
    conversationCount: number
  }>
}

export interface JobRunSummaryResponse {
  jobRunId: string
  jobId: string
  jobName: string
  status: string
  startedAt: string
  finishedAt: string | null
  totalConversations: number
  evaluatedConversations: number
  skippedConversations: number
  summary: string | null
}
