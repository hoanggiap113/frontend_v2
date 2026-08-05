import { Progress, Tag, Typography } from 'antd'
import { EmptyState, SectionCard } from '#/shared/ui/index'
import { formatNumber } from '#/shared/lib/number-helper'
import type { TagStatsResponse } from '../types'

function getDisplayTag(tag: string) {
  if (!tag || tag === 'Unclassified') return 'Chưa phân loại'
  return tag
}

export default function DashboardTagStats({
  tags,
}: {
  tags?: TagStatsResponse['tags']
}) {
  const rows = tags ?? []
  const total = rows.reduce((sum, item) => sum + item.conversationCount, 0)

  return (
    <SectionCard
      title="Hội thoại theo tag"
      description="Phân bố hội thoại theo nhãn phân loại."
      extra={
        <Tag bordered={false} className="!m-0">
          {formatNumber(total)} hội thoại
        </Tag>
      }
      bodyClassName="!p-0"
    >
      {rows.length === 0 ? (
        <EmptyState
          compact
          title="Chưa có dữ liệu tag"
          description="Dữ liệu sẽ xuất hiện sau khi tác vụ phân loại hoàn tất."
        />
      ) : (
        <div className="space-y-4 p-5">
          {rows.slice(0, 8).map((item) => {
            const percent =
              total > 0 ? Math.round((item.conversationCount / total) * 100) : 0

            return (
              <div key={item.tag}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <Typography.Text strong className="min-w-0 truncate text-sm">
                    {getDisplayTag(item.tag)}
                  </Typography.Text>
                  <Typography.Text className="shrink-0 text-xs font-bold">
                    {formatNumber(item.conversationCount)} · {percent}%
                  </Typography.Text>
                </div>
                <Progress
                  percent={percent}
                  showInfo={false}
                  size="small"
                  strokeColor="#7c3aed"
                  trailColor="#f0edf9"
                  className="!mb-0"
                />
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
