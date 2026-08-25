import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import { ROUTE_TITLES } from '#/constant'
import { useCurrentTenant } from '#/app/providers/TenantProvider'
import { useTenant } from '#/lib/hooks/useTenant'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { currentTenantId, selectTenant } = useCurrentTenant()
  const { data: tenantPage } = useTenant({ page: 1, limit: 10 })
  const tenants = tenantPage?.data ?? []
  const currentTenant = tenants.find((tenant) => tenant.id === currentTenantId)
  const pageTitle =
    ROUTE_TITLES.find(({ match }) => match.test(pathname))?.title ??
    'Chat Quality Agent'

  useEffect(() => {
    if (!currentTenantId && tenants[0]) {
      selectTenant(tenants[0].id)
    }
  }, [currentTenantId, selectTenant, tenants])

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        currentTenant={currentTenant}
        currentTenantId={currentTenantId}
        tenants={tenants}
        onSelectTenant={selectTenant}
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
