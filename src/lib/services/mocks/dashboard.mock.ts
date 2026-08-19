import type {
  AgentStatsResponse,
  JobRunSummaryResponse,
  OverviewResponse,
  ScoreTrendResponse,
  TagStatsResponse,
} from '../../types/dashboard'

const today = new Date()

function isoDaysAgo(days: number) {
  const date = new Date(today)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function dateDaysAgo(days: number) {
  return isoDaysAgo(days).slice(0, 10)
}

export const mockDashboardOverview: OverviewResponse = {
  totalEvaluated: 384,
  avgScore: 8.2,
  passRate: 86.7,
  totalViolations: 51,
  violationsBySeverity: {
    LOW: 19,
    MEDIUM: 21,
    HIGH: 9,
    CRITICAL: 2,
  },
}

export const mockDashboardAgents: AgentStatsResponse = {
  agents: [
    {
      agentId: 'mock-agent-1',
      agentName: 'Nguyễn Minh Anh',
      avgScore: 9.1,
      totalEvaluated: 96,
      passRate: 94.8,
    },
    {
      agentId: 'mock-agent-2',
      agentName: 'Trần Hoàng Nam',
      avgScore: 8.6,
      totalEvaluated: 82,
      passRate: 89.1,
    },
    {
      agentId: 'mock-agent-3',
      agentName: 'Lê Thu Hà',
      avgScore: 7.8,
      totalEvaluated: 74,
      passRate: 82.4,
    },
    {
      agentId: 'mock-agent-4',
      agentName: 'Phạm Gia Bảo',
      avgScore: 6.9,
      totalEvaluated: 61,
      passRate: 72.1,
    },
  ],
}

export const mockDashboardScoreTrend: ScoreTrendResponse = {
  trend: [
    { date: dateDaysAgo(6), avgScore: 7.4, total: 42, passed: 32 },
    { date: dateDaysAgo(5), avgScore: 7.8, total: 48, passed: 39 },
    { date: dateDaysAgo(4), avgScore: 8.1, total: 55, passed: 47 },
    { date: dateDaysAgo(3), avgScore: 7.9, total: 44, passed: 36 },
    { date: dateDaysAgo(2), avgScore: 8.4, total: 63, passed: 56 },
    { date: dateDaysAgo(1), avgScore: 8.6, total: 58, passed: 52 },
    { date: dateDaysAgo(0), avgScore: 8.2, total: 74, passed: 66 },
  ],
}

export const mockDashboardTags: TagStatsResponse = {
  tags: [
    { tag: 'Khiếu nại', conversationCount: 86 },
    { tag: 'Hỏi giá', conversationCount: 64 },
    { tag: 'Đơn hàng', conversationCount: 51 },
    { tag: 'Bảo hành', conversationCount: 29 },
    { tag: 'Chưa phân loại', conversationCount: 18 },
  ],
}

export const mockDashboardJobRuns: JobRunSummaryResponse[] = [
  {
    jobRunId: 'mock-run-1',
    jobId: 'mock-job-1',
    jobName: 'Đánh giá chất lượng hội thoại Facebook',
    status: 'SUCCESS',
    startedAt: isoDaysAgo(0),
    finishedAt: new Date(today.getTime() - 1000 * 60 * 18).toISOString(),
    totalConversations: 74,
    evaluatedConversations: 71,
    skippedConversations: 3,
    summary:
      'Phát hiện 6 hội thoại cần xem lại: 4 case trả lời thiếu thông tin và 2 case có rủi ro SLA.',
  },
  {
    jobRunId: 'mock-run-2',
    jobId: 'mock-job-2',
    jobName: 'Phân tích CSKH Zalo OA',
    status: 'SUCCESS',
    startedAt: isoDaysAgo(1),
    finishedAt: new Date(today.getTime() - 1000 * 60 * 60 * 23).toISOString(),
    totalConversations: 58,
    evaluatedConversations: 55,
    skippedConversations: 3,
    summary:
      'Điểm trung bình tốt, đa số phản hồi đúng kịch bản. Có 3 hội thoại cần bổ sung hướng dẫn xử lý khiếu nại.',
  },
  {
    jobRunId: 'mock-run-3',
    jobId: 'mock-job-3',
    jobName: 'Rà soát hội thoại có khiếu nại',
    status: 'PARTIAL',
    startedAt: isoDaysAgo(2),
    finishedAt: new Date(today.getTime() - 1000 * 60 * 60 * 49).toISOString(),
    totalConversations: 63,
    evaluatedConversations: 47,
    skippedConversations: 16,
    summary:
      'Một phần hội thoại bị bỏ qua vì thiếu tối thiểu 3 tin nhắn. Các hội thoại còn lại đã được phân loại theo severity.',
  },
  {
    jobRunId: 'mock-run-4',
    jobId: 'mock-job-4',
    jobName: 'Theo dõi SLA hôm nay',
    status: 'RUNNING',
    startedAt: new Date(today.getTime() - 1000 * 60 * 12).toISOString(),
    finishedAt: null,
    totalConversations: 40,
    evaluatedConversations: 18,
    skippedConversations: 0,
    summary: 'Đang xử lý batch hội thoại mới trong ngày.',
  },
  {
    jobRunId: 'mock-run-5',
    jobId: 'mock-job-5',
    jobName: 'Đánh giá tone of voice',
    status: 'FAILED',
    startedAt: isoDaysAgo(4),
    finishedAt: new Date(today.getTime() - 1000 * 60 * 60 * 96).toISOString(),
    totalConversations: 30,
    evaluatedConversations: 0,
    skippedConversations: 30,
    summary: 'Không thể gọi model trong lần chạy thử nghiệm.',
  },
]
