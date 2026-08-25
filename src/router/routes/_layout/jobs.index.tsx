import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

export const Route = createFileRoute('/_layout/jobs/')({
  component: () => <PlaceholderPage title="Tác vụ AI" />,
})
