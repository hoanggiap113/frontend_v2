import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  fluid?: boolean
}

export default function PageContainer({
  children,
  className = '',
  fluid = false,
}: PageContainerProps) {
  return (
    <div
      className={`page-container ${fluid ? 'page-container--fluid' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
