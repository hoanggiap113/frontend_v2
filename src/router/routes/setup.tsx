import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

export const Route = createFileRoute('/setup')({
  component: () => <PlaceholderPage title="Thiết lập tài khoản" />,
})
