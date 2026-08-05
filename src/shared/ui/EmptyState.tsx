import type { ReactNode } from 'react'
import { Empty } from 'antd'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

export default function EmptyState({
  title = 'Chưa có dữ liệu',
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`app-empty-state ${compact ? 'app-empty-state--compact' : ''}`}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div className="app-empty-state__title">{title}</div>
            {description ? (
              <div className="app-empty-state__description">{description}</div>
            ) : null}
          </div>
        }
      >
        {action}
      </Empty>
    </div>
  )
}
