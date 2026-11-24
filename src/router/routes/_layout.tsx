import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AdminLayout } from '#/app/layout/index'
import { getStoredTenant } from '#/app/providers/TenantProvider'
import { requireSession } from '../requireSession'

export const Route = createFileRoute('/_layout')({
  beforeLoad: async ({ context }) => {
    await requireSession(context.queryClient)
    if (!getStoredTenant()) {
      throw redirect({ to: '/tenants', replace: true })
    }
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
