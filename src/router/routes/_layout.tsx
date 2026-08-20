import { AdminLayout } from '#/app/layout/index'
import { hasStoredSession } from '#/lib/browser-storage'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      if (!hasStoredSession()) {
        throw redirect({ to: '/login' })
      }
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
