import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

export const Route = createFileRoute('/_layout/')({
  component: () => <PlaceholderPage title="Tổng quan" />,
})
