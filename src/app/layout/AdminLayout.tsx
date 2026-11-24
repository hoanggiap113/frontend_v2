import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import { ROUTE_TITLES } from '#/constant'
import { useCurrentTenant } from '#/app/providers/TenantProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { currentTenant } = useCurrentTenant()
  const pageTitle =
    ROUTE_TITLES.find(({ match }) => match.test(pathname))?.title ??
    'Chat Quality Agent'

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        currentTenant={currentTenant}
      />
      <div className="app-shell__main">
        <Header
          currentTenant={currentTenant}
          pageTitle={pageTitle}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        />
        <main className="app-shell__content app-scrollbar">{children}</main>
      </div>
    </div>
  )
}
