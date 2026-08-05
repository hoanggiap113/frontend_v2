import type { ReactNode } from 'react'
import { Badge, Tag } from 'antd'

export type StatusTone =
  | 'success'
  | 'processing'
  | 'warning'
  | 'error'
  | 'default'

interface StatusTagProps {
  children: ReactNode
  tone?: StatusTone
  dot?: boolean
}

const colors: Record<StatusTone, string | undefined> = {
  success: 'green',
  processing: 'blue',
  warning: 'gold',
  error: 'red',
  default: undefined,
}

export default function StatusTag({
  children,
  tone = 'default',
  dot = false,
}: StatusTagProps) {
  if (dot) {
    return (
      <Badge
        status={tone === 'processing' ? 'processing' : tone}
        text={<span className="app-status-dot-text">{children}</span>}
      />
    )
  }

  return (
    <Tag color={colors[tone]} bordered={false} className="app-status-tag">
      {children}
    </Tag>
  )
}
