import type { ReactNode } from 'react'
import { Typography } from 'antd'

interface MetricTileProps {
  label: ReactNode
  value: ReactNode
  note?: ReactNode
  icon?: ReactNode
  accent?: string
}

export default function MetricTile({
  label,
  value,
  note,
  icon,
  accent = '#0f8f4e',
}: MetricTileProps) {
  return (
    <div className="metric-tile">
      <div className="metric-tile__top">
        <Typography.Text className="metric-tile__label">{label}</Typography.Text>
        {icon ? (
          <span
            className="metric-tile__icon"
            style={{ color: accent, backgroundColor: `${accent}12` }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="metric-tile__value">{value}</div>
      {note ? <div className="metric-tile__note">{note}</div> : null}
    </div>
  )
}
