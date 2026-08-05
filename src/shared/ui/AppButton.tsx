import type { ButtonProps } from 'antd'
import { Button } from 'antd'

export type AppButtonProps = ButtonProps & {
  compact?: boolean
}

export default function AppButton({
  compact = false,
  className = '',
  ...props
}: AppButtonProps) {
  return (
    <Button
      {...props}
      className={`app-button ${compact ? 'app-button--compact' : ''} ${className}`.trim()}
    />
  )
}
