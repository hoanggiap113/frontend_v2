import { Tag, Typography } from 'antd'
import { AppCard } from '#/components'
import {
  type AppIcon,
  Minus,
  TrendingDown,
  TrendingUp,
} from '#/components/ui/icons'

interface MiniBarChartProps {
  data: number[]
  color: string
}

function MiniBarChart({ data, color }: MiniBarChartProps) {
  const max = Math.max(...data, 1)

  return (
    <div className="flex h-9 items-end gap-[3px]" aria-hidden="true">
      {data.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="w-[5px] rounded-sm transition-[height] duration-500"
          style={{
            backgroundColor: color,
            height: `${Math.max((value / max) * 100, 8)}%`,
            opacity: index === data.length - 1 ? 1 : 0.35 + (index / data.length) * 0.45,
          }}
        />
      ))}
    </div>
  )
}

export interface StatCardProps {
  title: string
  value: string
  description: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: AppIcon
  color: string
  colorBg: string
  data: number[]
  delay?: number
}

export default function StatCard({
  title,
  value,
  description,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  colorBg,
  data,
  delay = 0,
}: StatCardProps) {
  const ChangeIcon =
    changeType === 'up'
      ? TrendingUp
      : changeType === 'down'
        ? TrendingDown
        : Minus
  const changeColor =
    changeType === 'up' ? 'green' : changeType === 'down' ? 'red' : undefined

  return (
    <AppCard
      className="stat-card animate-in"
      style={{ animationDelay: `${delay}s` }}
      styles={{ body: { padding: 18 } }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Typography.Text className="block text-xs font-bold text-slate-500">
            {title}
          </Typography.Text>
          <div className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        <span
          className="grid size-10 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: colorBg, color }}
        >
          <Icon size={18} />
        </span>
      </div>

      <Typography.Paragraph
        type="secondary"
        ellipsis={{ rows: 2 }}
        className="!mb-0 !mt-2 min-h-10 !text-xs !leading-5"
      >
        {description}
      </Typography.Paragraph>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
        {change ? (
          <Tag color={changeColor} bordered={false} className="!m-0">
            <span className="inline-flex items-center gap-1 font-semibold">
              <ChangeIcon size={11} />
              {change}
            </span>
          </Tag>
        ) : (
          <Typography.Text type="secondary" className="text-xs">
            Theo khoảng lọc
          </Typography.Text>
        )}

        <MiniBarChart data={data} color={color} />
      </div>
    </AppCard>
  )
}
