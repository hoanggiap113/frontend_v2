import type { ReactNode } from 'react'
import { Space, Typography } from 'antd'
import AppCard from '#/components/ui/AppCard'

interface SectionCardProps {
  title?: ReactNode
  description?: ReactNode
  extra?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export default function SectionCard({
  title,
  description,
  extra,
  children,
  className = '',
  bodyClassName = '',
}: SectionCardProps) {
  const hasHeading = title || description || extra

  return (
    <AppCard
      className={`section-card ${className}`.trim()}
      title={
        hasHeading ? (
          <div className="section-card__header">
            <div className="min-w-0">
              {title ? (
                <Typography.Text strong className="section-card__title">
                  {title}
                </Typography.Text>
              ) : null}
              {description ? (
                <Typography.Text className="section-card__description">
                  {description}
                </Typography.Text>
              ) : null}
            </div>
            {extra ? <Space size={8}>{extra}</Space> : null}
          </div>
        ) : undefined
      }
      styles={{ body: { padding: 0 } }}
    >
      <div className={`section-card__body ${bodyClassName}`.trim()}>
        {children}
      </div>
    </AppCard>
  )
}
