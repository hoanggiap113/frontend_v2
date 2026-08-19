import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

function NotificationHistoryRoute() {
  return <PlaceholderPage title="Lịch sử thông báo" />
}

export const Route = createFileRoute('/_layout/noti-history')({
  component: NotificationHistoryRoute,
})
