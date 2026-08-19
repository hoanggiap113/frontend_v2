import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

function ActivityLogRoute() {
  return <PlaceholderPage title="Audit log" />
}

export const Route = createFileRoute('/_layout/activity-log')({
  component: ActivityLogRoute,
})
