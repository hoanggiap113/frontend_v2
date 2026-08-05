import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/shared/components/PlaceholderPage'

function CostLogRoute() {
  return <PlaceholderPage title="Nhật ký chi phí" />
}

export const Route = createFileRoute('/_layout/cost-log')({
  component: CostLogRoute,
})
