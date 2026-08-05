import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Input, Segmented, Tag, Typography } from 'antd'
import DashboardAgentLeaderboard from '../components/DashboardAgentLeaderboard'
import DashboardScoreTrend from '../components/DashboardScoreTrend'
import DashboardTagStats from '../components/DashboardTagStats'
import LoadingState from '#/shared/components/LoadingState'
import RecentActivity from '../components/RecentActivity'
import StatCard, { type StatCardProps } from '../components/StatCard'
import {
  AppButton,
  FilterBar,
  PageContainer,
  PageHeader,
} from '#/shared/ui/index'
import {
  formatCurrentFullDate,
  formatCurrentTime,
} from '#/shared/lib/datetime-helper'
import { formatNumber } from '#/shared/lib/number-helper'
import { dashboardService } from '../service/dashboard.service'
import type { DashboardFilter, OverviewResponse } from '../types'
import { queryKeys } from '#/shared/service/query-keys'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Cpu,
  MessageSquare,
  TrendingUp,
  Zap,
} from '#/shared/ui/icons'

type StatItem = Omit<StatCardProps, 'delay'>
type DashboardRangeKey = '7d' | '30d' | '90d' | 'custom'

const emptyOverview: OverviewResponse = {
  totalEvaluated: 0,
  avgScore: 0,
  passRate: 0,
  totalViolations: 0,
  violationsBySeverity: {},
}

const dashboardQueryBehavior = {
  retry: false,
  refetchOnWindowFocus: false,
} as const

const rangeOptions: Array<{
  key: Exclude<DashboardRangeKey, 'custom'>
  label: string
  days: number
}> = [
  { key: '7d', label: '7 ngày', days: 7 },
  { key: '30d', label: '30 ngày', days: 30 },
  { key: '90d', label: '90 ngày', days: 90 },
]

function trendValues<T>(
  items: T[] | undefined,
  mapper: (item: T) => number,
  fallback: number,
) {
  const values = items?.map(mapper).filter((value) => Number.isFinite(value))
  return values && values.length > 0 ? values : [fallback]
}

function toDateInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function getDateDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toDateInputValue(date)
}

function getRangeFilter(rangeKey: DashboardRangeKey, from: string, to: string) {
  if (rangeKey === 'custom') {
    return {
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(`${to}T23:59:59.999`).toISOString(),
    }
  }

  const option = rangeOptions.find((item) => item.key === rangeKey)
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - (option?.days ?? 30))

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  }
}

function getRangeLabel(rangeKey: DashboardRangeKey, from: string, to: string) {
  if (rangeKey === 'custom') return `${from} đến ${to}`
  return rangeOptions.find((item) => item.key === rangeKey)?.label ?? '30 ngày'
}

export default function HomePage() {
  const navigate = useNavigate()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const useLiveDashboard = Boolean(workspaceId)
  const [rangeKey, setRangeKey] = useState<DashboardRangeKey>('30d')
  const [customFrom, setCustomFrom] = useState(() => getDateDaysAgo(30))
  const [customTo, setCustomTo] = useState(() => toDateInputValue(new Date()))

  const dashboardFilter = useMemo<DashboardFilter>(
    () => getRangeFilter(rangeKey, customFrom, customTo),
    [customFrom, customTo, rangeKey],
  )
  const dashboardFilterKey = useMemo(
    () => `${dashboardFilter.from}|${dashboardFilter.to}`,
    [dashboardFilter.from, dashboardFilter.to],
  )
  const rangeLabel = getRangeLabel(rangeKey, customFrom, customTo)

  const { data: overviewData, isFetching: overviewFetching } = useQuery({
    enabled: useLiveDashboard,
    queryKey: queryKeys.dashboardOverview(
      workspaceId || 'default',
      dashboardFilterKey,
    ),
    queryFn: () => dashboardService.overview(workspaceId, dashboardFilter),
    ...dashboardQueryBehavior,
  })

  const { data: agentStats, isFetching: agentsFetching } = useQuery({
    enabled: useLiveDashboard,
    queryKey: queryKeys.dashboardAgents(
      workspaceId || 'default',
      dashboardFilterKey,
    ),
    queryFn: () => dashboardService.agents(workspaceId, dashboardFilter),
    ...dashboardQueryBehavior,
  })

  const { data: scoreTrend, isFetching: scoreTrendFetching } = useQuery({
    enabled: useLiveDashboard,
    queryKey: queryKeys.dashboardScoreTrend(
      workspaceId || 'default',
      dashboardFilterKey,
    ),
    queryFn: () => dashboardService.scoreTrend(workspaceId, dashboardFilter),
    ...dashboardQueryBehavior,
  })

  const { data: tagStats, isFetching: tagStatsFetching } = useQuery({
    enabled: useLiveDashboard,
    queryKey: queryKeys.dashboardTags(workspaceId || 'default'),
    queryFn: () => dashboardService.tags(workspaceId),
    ...dashboardQueryBehavior,
  })

  const { data: jobRuns = [], isFetching: jobRunsFetching } = useQuery({
    enabled: useLiveDashboard,
    queryKey: queryKeys.dashboardJobRuns(
      workspaceId || 'default',
      dashboardFilterKey,
    ),
    queryFn: () => dashboardService.jobRuns(workspaceId, dashboardFilter, 8),
    ...dashboardQueryBehavior,
  })

  const overview = overviewData ?? emptyOverview
  const dashboardFetching =
    overviewFetching ||
    agentsFetching ||
    scoreTrendFetching ||
    tagStatsFetching ||
    jobRunsFetching
  const runningRuns = jobRuns.filter((run) =>
    ['PENDING', 'RUNNING'].includes(run.status),
  ).length

  const stats = useMemo<StatItem[]>(() => {
    const trend = scoreTrend?.trend

    return [
      {
        title: 'Hội thoại đã chấm',
        value: formatNumber(overview.totalEvaluated),
        description:
          'Số hội thoại đã có kết quả QC hoặc phân loại trong khoảng thời gian đang chọn.',
        icon: MessageSquare,
        color: '#6366f1',
        colorBg: '#ede9fe',
        data: trendValues(trend, (item) => item.total, overview.totalEvaluated),
      },
      {
        title: 'Điểm trung bình',
        value: overview.avgScore.toFixed(1),
        description:
          'Điểm QC trung bình trên thang 10, tính từ các hội thoại đã được AI đánh giá.',
        icon: CheckCircle2,
        color: '#10b981',
        colorBg: '#d1fae5',
        data: trendValues(trend, (item) => item.avgScore, overview.avgScore),
      },
      {
        title: 'Tỷ lệ đạt',
        value: `${overview.passRate.toFixed(1)}%`,
        description:
          'Phần trăm hội thoại đạt chuẩn QC so với tổng số hội thoại đã được chấm.',
        icon: TrendingUp,
        color: '#f59e0b',
        colorBg: '#fef3c7',
        data: trendValues(
          trend,
          (item) => (item.total > 0 ? (item.passed / item.total) * 100 : 0),
          overview.passRate,
        ),
      },
      {
        title: 'Tổng vi phạm',
        value: formatNumber(overview.totalViolations),
        description:
          'Tổng số lỗi AI phát hiện trong các hội thoại, gom theo mức độ nghiêm trọng.',
        icon: AlertCircle,
        color: '#ef4444',
        colorBg: '#fee2e2',
        data: Object.values(overview.violationsBySeverity).length
          ? Object.values(overview.violationsBySeverity)
          : [0],
      },
      {
        title: 'Job đang chạy',
        value: formatNumber(runningRuns),
        description:
          'Số tác vụ AI đang chờ xử lý hoặc đang chạy, giúp biết hệ thống còn việc nền.',
        icon: Cpu,
        color: '#8b5cf6',
        colorBg: '#ede9fe',
        data: trendValues(jobRuns, (item) => item.evaluatedConversations, 0),
      },
    ]
  }, [jobRuns, overview, runningRuns, scoreTrend?.trend])

  const heroDescription = useLiveDashboard
    ? `Trong ${rangeLabel}, workspace hiện có ${formatNumber(overview.totalEvaluated)} hội thoại đã đánh giá, điểm trung bình ${overview.avgScore.toFixed(1)}/10 và ${formatNumber(overview.totalViolations)} vi phạm được ghi nhận.`
    : 'Chọn workspace để xem dashboard theo dữ liệu hệ thống.'



  return (
    <PageContainer>
      <PageHeader
        eyebrow="Dashboard vận hành"
        title="Tổng quan chất lượng hội thoại"
        description={heroDescription}
        actions={
          <>
            <AppButton
              icon={<TrendingUp size={15} />}
              onClick={() => navigate({ to: '/jobs' })}
            >
              Xem tác vụ
            </AppButton>
            <AppButton
              type="primary"
              icon={<Zap size={15} />}
              onClick={() => navigate({ to: '/jobs/create' })}
            >
              Tạo tác vụ AI
            </AppButton>
          </>
        }
        extra={
          <div className="flex flex-wrap items-center gap-3">
            <Tag color="green" bordered={false}>
              Hệ thống hoạt động bình thường
            </Tag>
            <Typography.Text type="secondary" className="text-xs">
              {formatCurrentFullDate()} · {formatCurrentTime()}
            </Typography.Text>
          </div>
        }
      />

      <FilterBar
        right={
          dashboardFetching ? (
            <LoadingState variant="inline" title="Đang cập nhật dashboard" />
          ) : (
            <Typography.Text type="secondary" className="text-xs">
              Dữ liệu: {rangeLabel}
            </Typography.Text>
          )
        }
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <CalendarDays size={17} />
          </span>
          Khoảng thời gian
        </div>

        <Segmented
          value={rangeKey}
          onChange={(value) => setRangeKey(value as DashboardRangeKey)}
          options={[
            ...rangeOptions.map((item) => ({
              label: item.label,
              value: item.key,
            })),
            { label: 'Tùy chọn', value: 'custom' },
          ]}
        />
      </FilterBar>

      {rangeKey === 'custom' ? (
        <div className="mb-5 grid gap-3 rounded-[10px] border border-emerald-100 bg-emerald-50/50 p-4 md:grid-cols-[1fr_auto_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">
              Từ ngày
            </span>
            <Input
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
          </label>
          <div className="hidden items-end pb-2 text-sm text-slate-400 md:flex">
            đến
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">
              Đến ngày
            </span>
            <Input
              type="date"
              value={customTo}
              min={customFrom}
              max={toDateInputValue(new Date())}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {stats.map((item, index) => (
          <StatCard key={item.title} {...item} delay={index * 0.04} />
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)_minmax(280px,0.8fr)]">
        <RecentActivity jobRuns={jobRuns} />
        <DashboardTagStats tags={tagStats?.tags} />
        <DashboardScoreTrend trend={scoreTrend?.trend} />
      </div>

      <DashboardAgentLeaderboard agents={agentStats?.agents} />
    </PageContainer>
  )
}
