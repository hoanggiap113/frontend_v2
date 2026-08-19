import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

function SystemLogRoute() {
  return <PlaceholderPage title="Nhật ký hệ thống" />
}

export const Route = createFileRoute('/_layout/system-log')({
  component: SystemLogRoute,
})
