import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

export const Route = createFileRoute('/_layout/jobs/$jobId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PlaceholderPage title="Chi tiết tác vụ AI" />
}
