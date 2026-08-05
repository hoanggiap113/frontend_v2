import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  right?: ReactNode
  className?: string
}

export default function FilterBar({
  children,
  right,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`filter-bar ${className}`.trim()}>
      <div className="filter-bar__left">{children}</div>
      {right ? <div className="filter-bar__right">{right}</div> : null}
    </div>
  )
}
