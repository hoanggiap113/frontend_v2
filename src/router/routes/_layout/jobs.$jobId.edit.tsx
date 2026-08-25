import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

export const Route = createFileRoute('/_layout/jobs/$jobId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PlaceholderPage title="Chỉnh sửa tác vụ AI" />
}
