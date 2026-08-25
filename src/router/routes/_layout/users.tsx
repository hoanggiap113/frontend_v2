import PlaceholderPage from '#/router/components/PlaceholderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users')({
  component: () => <PlaceholderPage title="Người dùng" />,
})
