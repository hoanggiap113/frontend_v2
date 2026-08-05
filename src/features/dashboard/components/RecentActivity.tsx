import { Progress, Tag, Typography } from 'antd'
import { EmptyState, SectionCard } from '#/shared/ui/index'
import {
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  LoaderCircle,
  type AppIcon,
} from '#/shared/ui/icons'
import ScrollArea from '#/shared/components/ScrollArea'
import { formatDateTime, formatDuration } from '#/shared/lib/datetime-helper'
import type { JobRunSummaryResponse } from '../types'

interface Activity {
  id: string
  user: string
  message: string
  details: string[]
  score: number
  label: string
  color: string
  bg: string
  icon: AppIcon
  time: string
  tags: string[]
}

interface ParsedRunSummary {
  agentScores?: Record<string, number>
  averageScore?: number
  categoryDistribution?: Record<string, number>
  evaluatedConversations?: number
  skippedConversations?: number
  totalClassified?: number
  totalConversations?: number
}

function getRunVisual(
  status: string,
): Pick<Activity, 'bg' | 'color' | 'icon' | 'label'> {
  if (status === 'SUCCESS') {
    return {
      bg: '#d1fae5',
      color: '#10b981',
      icon: CheckCircle,
      label: 'Thành công',
    }
  }

  if (status === 'RUNNING' || status === 'PENDING') {
    return {
      bg: '#ede9fe',
      color: '#6366f1',
      icon: LoaderCircle,
      label: 'Đang chạy',
    }
  }

  if (status === 'PARTIAL') {
    return {
      bg: '#fef3c7',
      color: '#f59e0b',
      icon: AlertCircle,
      label: 'Một phần',
    }
  }

  return {
    bg: '#fee2e2',
    color: '#ef4444',
    icon: AlertCircle,
    label: 'Thất bại',
  }
}

function getRunScore(run: JobRunSummaryResponse) {
  if (run.totalConversations <= 0) return 0
  return Number(
    ((run.evaluatedConversations / run.totalConversations) * 10).toFixed(1),
  )
}

function parseRunSummary(summary: string | null): ParsedRunSummary | null {
  if (!summary) return null

  try {
    const parsed = JSON.parse(summary) as ParsedRunSummary
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function formatCount(value: number, unit: string) {
  return `${value.toLocaleString('vi-VN')} ${unit}`
}

function formatFallbackRunMessage(run: JobRunSummaryResponse) {
  return `${run.evaluatedConversations}/${run.totalConversations} hội thoại đã đánh giá, ${run.skippedConversations} bị bỏ qua.`
}

function formatStructuredRunSummary(run: JobRunSummaryResponse): {
  details: string[]
  message: string
} {
  const parsed = parseRunSummary(run.summary)

  if (!parsed) {
    return {
      details: [],
      message: run.summary || formatFallbackRunMessage(run),
    }
  }

  const details: string[] = []
  const messages: string[] = []

  if (typeof parsed.totalClassified === 'number') {
    messages.push(
      `Đã phân loại ${formatCount(parsed.totalClassified, 'hội thoại')}`,
    )
  }

  if (typeof parsed.evaluatedConversations === 'number') {
    const total =
      typeof parsed.totalConversations === 'number'
        ? parsed.totalConversations
        : run.totalConversations

    messages.push(
      `Đã đánh giá ${parsed.evaluatedConversations.toLocaleString('vi-VN')}/${total.toLocaleString('vi-VN')} hội thoại`,
    )
  }

  if (typeof parsed.skippedConversations === 'number') {
    details.push(
      `Bỏ qua: ${parsed.skippedConversations.toLocaleString('vi-VN')}`,
    )
  }

  if (typeof parsed.averageScore === 'number') {
    details.push(`Điểm TB: ${parsed.averageScore.toFixed(1)}/10`)
  }

  Object.entries(parsed.categoryDistribution ?? {})
    .sort(([, countA], [, countB]) => countB - countA)
    .forEach(([category, count]) => {
      details.push(`${category}: ${count.toLocaleString('vi-VN')}`)
    })

  const agentScores = Object.entries(parsed.agentScores ?? {})
  if (agentScores.length > 0) {
    details.push(`Agent: ${agentScores.length} người có điểm`)
  }

  return {
    details,
    message: messages.join('. ') || 'Đã có summary dạng cấu trúc.',
  }
}

function toActivity(run: JobRunSummaryResponse): Activity {
  const visual = getRunVisual(run.status)
  const duration = run.finishedAt
    ? formatDuration(run.startedAt, run.finishedAt)
    : 'Đang xử lý'
  const summary = formatStructuredRunSummary(run)

  return {
    id: run.jobRunId,
    user: run.jobName,
    details: summary.details,
    message: summary.message,
    score: getRunScore(run),
    time: formatDateTime(run.startedAt),
    tags: [run.status, duration],
    ...visual,
  }
}

function ScoreBar({ score }: { score: number }) {
  const percent = Math.max(0, Math.min(score / 10, 1)) * 100
  const color = score >= 8 ? '#0f8f4e' : score >= 6 ? '#d99700' : '#d9363e'

  return (
    <div className="flex items-center gap-2">
      <Progress
        percent={percent}
        showInfo={false}
        size="small"
        strokeColor={color}
        trailColor="#eef0f2"
        className="!mb-0 flex-1"
      />
      <span className="min-w-8 text-right text-xs font-bold" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

export default function RecentActivity({
  jobRuns,
}: {
  jobRuns?: JobRunSummaryResponse[]
}) {
  const activities = jobRuns?.map(toActivity) ?? []

  return (
    <SectionCard
      title="Hoạt động gần đây"
      description="Các lần chạy tác vụ đánh giá mới nhất."
      extra={<Bot size={17} className="text-indigo-500" />}
      bodyClassName="!p-0"
    >
      <ScrollArea className="max-h-[440px]">
        {activities.length === 0 ? (
          <EmptyState
            compact
            title="Chưa có lần chạy tác vụ"
            description="Khi tác vụ đánh giá chạy xong, hoạt động sẽ xuất hiện tại đây."
          />
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon

            return (
              <article
                key={activity.id}
                className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-slate-50/70"
              >
                <span
                  className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: activity.bg, color: activity.color }}
                >
                  <Icon size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography.Text strong className="truncate text-sm">
                      {activity.user}
                    </Typography.Text>
                    <Tag
                      bordered={false}
                      className="!m-0"
                      style={{ backgroundColor: activity.bg, color: activity.color }}
                    >
                      {activity.label}
                    </Tag>
                    <Typography.Text
                      type="secondary"
                      className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-[11px] max-sm:ml-0"
                    >
                      <Clock size={11} />
                      {activity.time}
                    </Typography.Text>
                  </div>

                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 3 }}
                    className="!mb-2 !mt-1 !text-xs !leading-5"
                  >
                    {activity.message}
                  </Typography.Paragraph>

                  {activity.details.length > 0 ? (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {activity.details.map((detail) => (
                        <Tag key={detail} className="!m-0 !text-[10px]">
                          {detail}
                        </Tag>
                      ))}
                    </div>
                  ) : null}

                  <ScoreBar score={activity.score} />

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activity.tags.map((tag) => (
                      <Tag key={tag} bordered={false} className="!m-0 !text-[10px]">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </article>
            )
          })
        )}
      </ScrollArea>
    </SectionCard>
  )
}
