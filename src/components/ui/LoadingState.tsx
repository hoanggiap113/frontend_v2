import { Spin, Typography } from 'antd'

type LoadingStateVariant = 'page' | 'section' | 'inline' | 'overlay'

type LoadingStateProps = {
  title?: string
  description?: string
  variant?: LoadingStateVariant
  className?: string
}

export default function LoadingState({
  title = 'Đang tải dữ liệu',
  description,
  variant = 'section',
  className = '',
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Spin size="small" />
        <Typography.Text type="secondary">{title}</Typography.Text>
      </span>
    )
  }

  const content = (
    <div className="loading-state__content">
      <Spin size="large" />
      <Typography.Text strong>{title}</Typography.Text>
      {description ? (
        <Typography.Text
          type="secondary"
          className="loading-state__description"
        >
          {description}
        </Typography.Text>
      ) : null}
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div className={`loading-state loading-state--overlay ${className}`}>
        {content}
      </div>
    )
  }

  if (variant === 'page') {
    return (
      <div className={`loading-state loading-state--page ${className}`}>
        {content}
      </div>
    )
  }

  return (
    <div className={`loading-state loading-state--section ${className}`}>
      {content}
    </div>
  )
}
