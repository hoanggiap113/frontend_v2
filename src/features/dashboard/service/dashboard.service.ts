import { isMockMode } from '#/shared/config/env'
import {
  mockDashboardAgents,
  mockDashboardJobRuns,
  mockDashboardOverview,
  mockDashboardScoreTrend,
  mockDashboardTags,
} from '../data/mock_data'
import { endpoints } from '#/shared/service/endpoints'
import { httpClient, type RequestOptions } from '#/shared/service/http/client'
import { clone, mockDelay } from '#/shared/service/utils'

import type {
  AgentStatsResponse,
  DashboardFilter,
  JobRunSummaryResponse,
  OverviewResponse,
  ScoreTrendResponse,
  TagStatsResponse,
} from '../types'

const DEFAULT_DASHBOARD_RANGE_DAYS = 30

export function createDashboardDateRangeFilter(
  days = DEFAULT_DASHBOARD_RANGE_DAYS,
): DashboardFilter {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - days)

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

function normalizeFilter(filter?: DashboardFilter): DashboardFilter {
  const defaultRange = createDashboardDateRangeFilter()

  return {
    ...filter,
    from: filter?.from ?? defaultRange.from,
    to: filter?.to ?? defaultRange.to,
  }
}

function filterQuery(filter?: DashboardFilter): RequestOptions['query'] {
  const normalizedFilter = normalizeFilter(filter)

  return {
    from: normalizedFilter.from,
    to: normalizedFilter.to,
    jobId: normalizedFilter.jobId,
  }
}

async function withDashboardFallback<T>(
  request: () => Promise<T>,
  fallback: T,
) {
  if (isMockMode()) {
    await mockDelay()
    return clone(fallback)
  }

  try {
    return await request()
  } catch {
    return clone(fallback)
  }
}

export const dashboardService = {
  overview(workspaceId: string, filter?: DashboardFilter) {
    return withDashboardFallback(
      () =>
        httpClient.get<OverviewResponse>(
          endpoints.dashboard.overview(workspaceId),
          { query: filterQuery(filter) },
        ),
      mockDashboardOverview,
    )
  },

  agents(workspaceId: string, filter?: DashboardFilter) {
    return withDashboardFallback(
      () =>
        httpClient.get<AgentStatsResponse>(
          endpoints.dashboard.agents(workspaceId),
          { query: filterQuery(filter) },
        ),
      mockDashboardAgents,
    )
  },

  scoreTrend(workspaceId: string, filter?: DashboardFilter) {
    return withDashboardFallback(
      () =>
        httpClient.get<ScoreTrendResponse>(
          endpoints.dashboard.scoreTrend(workspaceId),
          { query: filterQuery(filter) },
        ),
      mockDashboardScoreTrend,
    )
  },

  tags(workspaceId: string) {
    return withDashboardFallback(
      () =>
        httpClient.get<TagStatsResponse>(endpoints.dashboard.tags(workspaceId)),
      mockDashboardTags,
    )
  },

  jobRuns(workspaceId: string, filter?: DashboardFilter, limit = 20) {
    return withDashboardFallback(
      () =>
        httpClient.get<JobRunSummaryResponse[]>(
          endpoints.dashboard.jobRuns(workspaceId),
          { query: { ...filterQuery(filter), limit } },
        ),
      mockDashboardJobRuns.slice(0, limit),
    )
  },
}
