import MetricTile from '#/shared/ui/MetricTile'
import type { AppIcon } from '#/shared/ui/icons'

export interface WorkspaceSummaryItem {
  icon: AppIcon
  label: string
  note: string
  value: number
}

const accents = ['#0f8f4e', '#1677ff', '#7c3aed', '#d97706']

export function WorkspaceSummaryGrid({
  items,
}: {
  items: WorkspaceSummaryItem[]
}) {
  return (
    <div className="metric-grid">
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <MetricTile
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            accent={accents[index % accents.length]}
            icon={<Icon size={18} />}
          />
        )
      })}
    </div>
  )
}
