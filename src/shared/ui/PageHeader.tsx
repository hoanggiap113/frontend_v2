import type { ReactNode } from 'react'
import { Space, Typography } from 'antd'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  extra?: ReactNode
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  extra,
}: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="page-header__content">
        {eyebrow ? <div className="page-header__eyebrow">{eyebrow}</div> : null}
        <Typography.Title level={2} className="page-header__title">
          {title}
        </Typography.Title>
        {description ? (
          <Typography.Text className="page-header__description">
            {description}
          </Typography.Text>
        ) : null}
        {extra ? <div className="page-header__extra">{extra}</div> : null}
      </div>
      {actions ? (
        <Space wrap size={10} className="page-header__actions">
          {actions}
        </Space>
      ) : null}
    </section>
  )
}
