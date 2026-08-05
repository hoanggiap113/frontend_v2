import { AdminLayout } from '#/app/layout'
import { readAccessToken } from '#/shared/lib/browser-storage'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const token = readAccessToken()
      if (!token) {
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
