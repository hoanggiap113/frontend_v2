import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminLayout } from '#/app/layout/index'

export const Route = createFileRoute('/_layout')({ component: LayoutComponent })

function LayoutComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
