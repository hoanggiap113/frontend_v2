import { Progress, Tag, Typography } from 'antd'
import { EmptyState, SectionCard } from '#/components'
import { Award, UserRound } from '#/components/ui/icons'
import { formatNumber } from '#/lib/helpers/number-helper'
import type { AgentStatsResponse } from '../../../lib/types/dashboard'

function getScoreTone(score: number) {
  if (score >= 8) return { color: '#0f8f4e', label: 'Tốt' }
  if (score >= 6) return { color: '#d99700', label: 'Cần theo dõi' }
  return { color: '#d9363e', label: 'Cần cải thiện' }
}

export default function DashboardAgentLeaderboard({
  agents,
}: {
  agents?: AgentStatsResponse['agents']
}) {
  const rows = agents ?? []

  return (
    <SectionCard
      title="Hiệu suất nhân viên"
      description="Xếp hạng theo điểm trung bình và tỷ lệ đạt."
      extra={<Award size={17} className="text-amber-500" />}
      bodyClassName="!p-0"
    >
      {rows.length === 0 ? (
        <EmptyState
          compact
          title="Chưa có dữ liệu nhân viên"
          description="Bảng xếp hạng sẽ xuất hiện khi kết quả đánh giá có thông tin agent."
        />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_180px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-500">
              <span>Nhân viên</span>
              <span className="text-right">Điểm</span>
              <span className="text-right">Tỷ lệ đạt</span>
              <span>Tiến độ</span>
            </div>

            {rows.map((agent, index) => {
              const scoreTone = getScoreTone(agent.avgScore)

              return (
                <div
                  key={agent.agentId}
                  className="grid grid-cols-[minmax(0,1fr)_100px_120px_180px] items-center gap-4 border-b border-slate-100 px-5 py-3 last:border-b-0 hover:bg-slate-50/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <UserRound size={16} />
                    </span>
                    <div className="min-w-0">
                      <Typography.Text strong className="block truncate text-sm">
                        #{index + 1} {agent.agentName}
                      </Typography.Text>
                      <Typography.Text type="secondary" className="text-xs">
                        {formatNumber(agent.totalEvaluated)} hội thoại
                      </Typography.Text>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold" style={{ color: scoreTone.color }}>
                      {agent.avgScore.toFixed(1)}
                    </div>
                    <Tag bordered={false} className="!m-0 mt-1 !text-[10px]">
                      {scoreTone.label}
                    </Tag>
                  </div>

                  <div className="text-right text-sm font-bold text-slate-700">
                    {agent.passRate.toFixed(1)}%
                  </div>

                  <Progress
                    percent={Math.min(agent.passRate, 100)}
                    showInfo={false}
                    strokeColor="#0f8f4e"
                    trailColor="#eef0f2"
                    size="small"
                    className="!mb-0"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
