import type { CardProps } from 'antd'
import { Card } from 'antd'

export type AppCardProps = CardProps & {
  muted?: boolean
}

export default function AppCard({
  muted = false,
  className = '',
  ...props
}: AppCardProps) {
  return (
    <Card
      {...props}
      className={`app-card ${muted ? 'app-card--muted' : ''} ${className}`.trim()}
    />
  )
}
