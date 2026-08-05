import { createFileRoute } from '@tanstack/react-router'
import { JobDetailPage } from '#/features/jobs/pages'

export const Route = createFileRoute('/_layout/jobs/$jobId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { jobId } = Route.useParams()
  return <JobDetailPage jobId={jobId} />
}
