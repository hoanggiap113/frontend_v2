import { Tag, Typography } from 'antd'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { EmptyState, SectionCard } from '#/components'
import { Activity, TrendingUp } from '#/components/ui/icons'
import { formatDate } from '#/lib/helpers/datetime-helper'
import type { ScoreTrendResponse } from '../../../lib/types/dashboard'

function CustomTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || payload.length === 0) return null

  const point = payload[0].payload as ScoreTrendResponse['trend'][number]

  return (
    <div className="rounded-lg bg-slate-800 px-3.5 py-2.5 text-xs text-white shadow-lg">
      <div className="mb-1 font-bold">{formatDate(String(label))}</div>
      <div className="text-emerald-300">{point.avgScore.toFixed(1)}/10</div>
      <div className="text-[11px] text-slate-300">
        {point.passed}/{point.total} hội thoại đạt
      </div>
    </div>
  )
}

export default function DashboardScoreTrend({
  trend,
}: {
  trend?: ScoreTrendResponse['trend']
}) {
  const data = trend ?? []
  const latest = data[data.length - 1]

  return (
    <SectionCard
      title="Xu hướng điểm"
      description="Điểm trung bình theo ngày."
      extra={<Activity size={17} className="text-emerald-600" />}
      bodyClassName="!p-0"
    >
      <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <Typography.Text type="secondary" className="text-xs">
            Điểm mới nhất
          </Typography.Text>
          <div className="mt-1 text-lg font-extrabold text-slate-800">
            {latest ? `${latest.avgScore.toFixed(1)}/10` : '0.0/10'}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <TrendingUp size={10} />
            {latest ? formatDate(latest.date) : 'Chưa có dữ liệu'}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <Typography.Text type="secondary" className="text-xs">
            Tổng mẫu
          </Typography.Text>
          <div className="mt-1 text-lg font-extrabold text-slate-800">
            {latest?.total ?? 0}
          </div>
          <Tag color="green" bordered={false} className="!m-0 mt-1 !text-[10px]">
            {latest?.passed ?? 0} đạt
          </Tag>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState
          compact
          title="Chưa có dữ liệu xu hướng"
          description="Điểm theo ngày sẽ xuất hiện sau khi có kết quả đánh giá."
        />
      ) : (
        <div className="px-1 pb-3 pt-4">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={data} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f8f4e" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#0f8f4e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#98a2b3' }}
                axisLine={false}
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#98a2b3' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgScore"
                stroke="#0f8f4e"
                strokeWidth={2}
                fill="url(#scoreTrendGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0f8f4e' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  )
}
